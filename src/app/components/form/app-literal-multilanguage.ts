import { Component, Input } from '@angular/core';
import { Localizable } from 'yti-common-ui/types/localization';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-literal-multilanguage',
  template: `
    <dl>
      <dt>
        <label *ngIf="label">{{label}}</label>
        <app-information-symbol *ngIf="infoText" [infoText]="infoText"></app-information-symbol>
      </dt>
      <dd>
        <div class="localized" *ngFor="let language of valueLanguages">
          <div class="language">{{ language.toUpperCase()}}</div>
          <div class="localization">{{ value[language] }}</div>
        </div>
      </dd>
    </dl>
  `
})
export class LiteralMultilanguageComponent {

  @Input() label: string;
  @Input() value: Localizable;
  @Input() infoText: string;

  constructor(public translateService: TranslateService,
              public languageService: LanguageService) {
  }

  get valueLanguages() {
    return Object.keys(this.value);
  }
}
