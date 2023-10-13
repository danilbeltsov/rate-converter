import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Urls } from '@shared/consts/urls.const';
import { HttpClient } from '@angular/common/http';
import {
  GenerateRateQuoteApiBody,
  GenerateRateQuoteApiPayload,
} from '@models/api-rate-quote.model';

@Injectable({
  providedIn: 'root',
})
export class QuoteApiService {
  constructor(private http: HttpClient) {}

  public getRateQuote(
    body: GenerateRateQuoteApiBody,
  ): Observable<GenerateRateQuoteApiPayload> {
    const url = Urls.rates.getQuotes;

    return this.http.post<GenerateRateQuoteApiPayload>(url, body);
  }
}
