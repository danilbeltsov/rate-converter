import { Component, Input, OnInit } from '@angular/core';
import { BaseControl } from '@components/controls/control-base';
import { CurrenciesEnum } from '@enums/currencies.enum';

@Component({
  selector: 'app-quote-input',
  templateUrl: './quote-input.component.html',
  styleUrls: ['./quote-input.component.scss'],
})
export class QuoteInputComponent extends BaseControl implements OnInit {
  @Input() currency = CurrenciesEnum.Usd;

  constructor() {
    super();
  }

  ngOnInit(): void {}
}
