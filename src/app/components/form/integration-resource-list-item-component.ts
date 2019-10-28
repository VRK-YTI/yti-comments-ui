import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IntegrationResource } from '../../entities/integration-resource';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageService } from '../../services/language.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-integration-resource-list-item',
  styleUrls: ['./integration-resource-list-item.component.scss'],
  template: `
    <div id="{{resource.id + '_resource_link'}}"
         class="resource-result" *ngIf="resource.expanded; else flattened" [class.last]="theLast">
      <div class="scrollable-content">
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
    <ng-template #flattened>
      <div class="flattened">
      </div>
    </ng-template>
  `
})
export class IntegrationResourceListItemComponent implements OnInit, OnDestroy {

  @Input() resource: IntegrationResource;
  @Input() theLast: any;
  @Input() expanded = true;
  @Input() selectedResources$: BehaviorSubject<IntegrationResource[]>;
  @Output() selectResourceEvent = new EventEmitter<IntegrationResource>();

  subscriptionsToClean: Subscription[] = [];
  infoText = 'the infotext';

  constructor(public configurationService: ConfigurationService,
              public languageService: LanguageService) {
  }

  emitSelectResourceEvent(resource: IntegrationResource) {
    resource.expanded = false;
    this.selectResourceEvent.emit(resource);
  }

  ngOnInit(): void {
    this.handleSubscribing();
  }

  // this is used to unhide the item in the list, if after selection, it gets de-selected by the user => the item must then expand itself
  handleSubscribing() {
    this.subscriptionsToClean.push(this.selectedResources$.subscribe(next => {
      let found = false;
      for (const resource of next) {
        if (resource.uri === this.resource.uri) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.resource.expanded = true;
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptionsToClean.forEach(s => s.unsubscribe());
  }
}
