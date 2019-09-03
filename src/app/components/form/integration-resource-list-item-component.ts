import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IntegrationResource } from '../../entity/integration-resource';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-integration-resource-list-item',
  styleUrls: ['./integration-resource-list-item.component.scss'],
  template: `
    <div id="{{resource.id + '_resource_link'}}"
         class="resource-result">
      <div class="scrollable-content" [class.last]="theLast">
        <app-status class="status" [status]="resource.status"></app-status>
        <span class="title" (click)="emitSelectResourceEvent(resource)">{{ resource.getDisplayName(languageService, true) }}</span>
        <div *ngIf="resource.getDescription(languageService, true) as descriptionText"
             class="description-container">
          <app-expandable-text [text]="descriptionText" [rows]="2" [captureClick]="true"></app-expandable-text>
        </div>
        <div>
          <span translate>Last modification</span><span>: {{ resource.modifiedDisplayValue }}</span>
        </div>
        <div>
          <a class="uri"
             href="{{configurationService.getUriWithEnv(resource.uri)}}" target="_blank">
            {{ configurationService.getUriWithEnv(resource.uri) }}
          </a>
        </div>
      </div>
    </div>
  `
})
export class IntegrationResourceListItemComponent {

  @Input() resource: IntegrationResource;
  @Input() theLast: any;
  @Output() selectResourceEvent = new EventEmitter<IntegrationResource>();

  infoText = 'the infotext';

  constructor(public configurationService: ConfigurationService,
              public languageService: LanguageService) {
  }

  emitSelectResourceEvent(resource: IntegrationResource) {
    this.selectResourceEvent.emit(resource);
  }
}
