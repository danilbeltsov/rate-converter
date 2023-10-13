import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RatesConverterComponent } from '@components/rates-converter/rates-converter.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SpinnerComponent } from '@components/spinner/spinner.component';
import { QuoteInputComponent } from '@components/controls/quote-input/quote-input.component';
import { DecimalOnlyDirective } from '@shared/directives/decimal-only.directive';

@NgModule({
  declarations: [
    AppComponent,
    RatesConverterComponent,
    DecimalOnlyDirective,
    SpinnerComponent,
    QuoteInputComponent,
  ],
  imports: [BrowserModule, HttpClientModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
