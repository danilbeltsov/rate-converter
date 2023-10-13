import { Directive, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Directive()
export class BaseControl {
  @Input() public placeholder = '';
  @Input() public controlName = '';
  @Input() public parentFormGroup: FormGroup = new FormGroup({});
  @Input() public id = '';
}
