import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  filter,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { CurrenciesEnum } from '@enums/currencies.enum';
import { positiveValueValidator } from '@helpers/custom-validators';
import {
  GenerateRateQuoteApiBody,
  GenerateRateQuoteApiPayload,
} from '@models/api-rate-quote.model';
import { QuoteApiService } from '@services/quote-api.service';

@Component({
  selector: 'app-rates-converter',
  templateUrl: './rates-converter.component.html',
  styleUrls: ['./rates-converter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesConverterComponent implements OnInit {
  public form: FormGroup = new FormGroup({});
  public currenciesEnum = CurrenciesEnum;
  public rateValue = '';
  public rateExpired = false;
  public lastAskedQuote!: GenerateRateQuoteApiBody;
  public interval: any;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public expiredSoon$ = new BehaviorSubject<boolean>(false);
  private expireAt = '';

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private quoteApiService: QuoteApiService,
  ) {}

  public ngOnInit(): void {
    this.initForm();
    this.subscribeToRatesForm();
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private initForm(): void {
    this.form = this.fb.group({
      sentAmount: ['', [positiveValueValidator()]],
      receivedAmount: ['', [positiveValueValidator()]],
    });
  }

  private subscribeToRatesForm(): void {
    const controls = this.form.controls;

    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      control.valueChanges
        .pipe(
          takeUntil(this.unsubscribe$),
          startWith(control.value),
          filter(
            (value) => !isNaN(value.slice(-1)) && !!value && !control.invalid,
          ),
          debounceTime(500),
          distinctUntilChanged(),
          map((value) => ({ [key]: value } as GenerateRateQuoteApiBody)),
          filter(() => control.value.length && !control.invalid),
          switchMap((quote: GenerateRateQuoteApiBody) => {
            this.removeExpireAtTimer();

            if (JSON.stringify(quote) === JSON.stringify(this.lastAskedQuote)) {
              this.isLoading$.next(false);
              this.setExpireAtTimer(this.expireAt);
              return EMPTY;
            }

            return this.getCurrentRateQuote(quote);
          }),
        )
        .subscribe((data: GenerateRateQuoteApiPayload) => {
          if (
            control.value !== data[key as keyof GenerateRateQuoteApiPayload]
          ) {
            this.isLoading$.next(false);
          }

          this.compareAndUpdate(data);
        });
    });
  }

  private getCurrentRateQuote(
    data: GenerateRateQuoteApiBody,
  ): Observable<GenerateRateQuoteApiPayload> {
    this.isLoading$.next(true);

    return this.quoteApiService.getRateQuote(data).pipe(
      tap(() => {
        this.lastAskedQuote = data;
      }),
      catchError((err) => {
        this.isLoading$.next(false);
        console.error(err);
        return EMPTY;
      }),
    );
  }

  private setExpireAtTimer(date: string): void {
    this.expireAt = date;
    const expireAt = new Date(date);

    if (this.interval) {
      this.removeExpireAtTimer();
      return;
    }

    this.interval = setInterval(() => {
      const currentTime = new Date();

      if (expireAt.getTime() - currentTime.getTime() <= 5000) {
        this.expiredSoon$.next(true);
      }

      if (currentTime.getTime() >= expireAt.getTime()) {
        this.removeExpireAtTimer();
        this.forceUpdateRates(this.lastAskedQuote);
      }
    }, 1000);
  }

  private removeExpireAtTimer(): void {
    this.expiredSoon$.next(false);
    clearInterval(this.interval);
    delete this.interval;
  }

  private forceUpdateRates(body: GenerateRateQuoteApiBody): void {
    this.rateExpired = true;
    this.getCurrentRateQuote(body)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.rateExpired = false;
        const key = Object.keys(body)[0];
        if (
          this.form.value[key] !==
          data[key as keyof GenerateRateQuoteApiPayload]
        ) {
          this.isLoading$.next(false);
          return;
        }

        this.compareAndUpdate(data);
      });
  }

  private compareWithCurrentRates(data: GenerateRateQuoteApiPayload): boolean {
    const { sentAmount, receivedAmount } = this.form.value;

    return (
      data.rate === this.rateValue &&
      data.sentAmount === sentAmount &&
      data.receivedAmount === receivedAmount
    );
  }

  private compareAndUpdate(data: GenerateRateQuoteApiPayload): void {
    if (!this.compareWithCurrentRates(data)) {
      this.updateRates(data);
    }

    this.isLoading$.next(false);
    this.setExpireAtTimer(data.expiresAt);
  }

  private updateRates(data: GenerateRateQuoteApiPayload): void {
    this.form.patchValue(
      {
        sentAmount: data.sentAmount,
        receivedAmount: data.receivedAmount,
      },
      { emitEvent: false },
    );

    this.rateValue = data.rate;
  }
}
