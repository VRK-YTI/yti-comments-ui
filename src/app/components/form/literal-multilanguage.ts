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
      <dd *ngIf="valueLanguages.length > 0">
        <div class="localized" *ngFor="let language of valueLanguages">
          <div *ngIf="language.toUpperCase() !== 'UND'" class="language">{{ language.toUpperCase()}}</div>
          <div class="localization">{{ value[language] }}</div>
        </div>
      </dd>
      <dd *ngIf="valueLanguages.length === 0">
        <span>-</span>
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

  get valueLanguages(): string[] {
    return Object.keys(this.value);
  }
}
