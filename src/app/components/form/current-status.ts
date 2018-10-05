import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-current-status',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>
        <app-status [status]="status"></app-status>
      </dd>
    </dl>
  `
})
export class CurrentStatusComponent {

  @Input() label: string;
  @Input() status: string;
  @Input() infoText: string;
}
