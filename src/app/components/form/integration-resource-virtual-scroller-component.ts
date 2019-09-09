import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { IntegrationResource } from '../../entity/integration-resource';
import { ConfigurationService } from '../../services/configuration.service';
import { LanguageService } from '../../services/language.service';
import { DataService } from '../../services/data.service';
import { IPageInfo, VirtualScrollerComponent } from 'ngx-virtual-scroller';
import { BehaviorSubject } from 'rxjs';
import { Status } from 'yti-common-ui/entities/status';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-integration-resource-virtual-scroller',
  styleUrls: ['./integration-resource-virtual-scroller.component.scss'],
  template: `
      <virtual-scroller #scroll [items]="buffer" (vsEnd)="fetchMore($event)" [enableUnequalChildrenSizes]="true">
        <app-integration-resource-list-item (selectResourceEvent)="emitSelectResourceEvent($event)"
                                            *ngFor="let item of scroll.viewPortItems; let last = last" [theLast]="last"
                                            [resource]="item" [expanded]="item.expanded"
                                            [selectedResources$]="selectedResources$"></app-integration-resource-list-item>
        <div *ngIf="this.buffer.length == 0">
          <span class="infoText" translate>Search did not find in any resources for commenting.</span>
        </div>
      </virtual-scroller>
  `
})
export class IntegrationResourceVirtualScrollerComponent {

  @Input() containerType: string;
  @Input() containerUri: string;
  @Input() language: string;
  @Input() items = new BehaviorSubject<IntegrationResource[]>([]);
  @Input() status$ = new BehaviorSubject<Status | null>(null);
  @Input() search$ = new BehaviorSubject('');
  @Input() restricts: string[];
  @Input() selectedResources$: BehaviorSubject<IntegrationResource[]>;
  public buffer: IntegrationResource[] = [];
  public loading = false;
  private previousRequestGotZeroResults = false; // this variable is used to stop an eternal loop in case of 0 results (due to filtering)

  private thePageSize = 200;

  @ViewChild(VirtualScrollerComponent)
  private virtualScroller: VirtualScrollerComponent;

  @Output() selectResourceEvent = new EventEmitter<IntegrationResource>();

  constructor(public configurationService: ConfigurationService,
              public languageService: LanguageService,
              private dataService: DataService) {
  }

  public fetchMore(event: IPageInfo) {

    if (this.loading || this.previousRequestGotZeroResults) {
      return;
    }

    if (event.endIndex !== this.buffer.length - 1) {
      return;
    }

    this.loading = true;
    this.fetchNextChunk(this.buffer.length, this.thePageSize).then(chunk => {

      for (const resource of chunk) {
        let found = false;
        for (const selectedResource of this.selectedResources$.value) {
          if (resource.uri === selectedResource.uri) {
            found = true;
          }
        }
        if (!found) {
          resource.expanded = true;
        } else {
          resource.expanded = false;
        }
      }

      this.buffer = this.buffer.concat(chunk.sort(comparingPrimitive<IntegrationResource>(
        integrationResource => this.languageService.isLocalizableEmpty(integrationResource.prefLabel))
        .andThen(comparingPrimitive<IntegrationResource>(integrationResource =>
          this.languageService.isLocalizableEmpty(integrationResource.prefLabel) ? integrationResource.localName : null))
        .andThen(comparingPrimitive<IntegrationResource>(integrationResource =>
          this.languageService.isLocalizableEmpty(integrationResource.prefLabel) && integrationResource.localName ?
            integrationResource.uri.toLowerCase() : null))
        .andThen(comparingLocalizable<IntegrationResource>(this.languageService,
          integrationResource => integrationResource.prefLabel ? integrationResource.prefLabel : {}))));
      if (chunk.length === 0) {
        this.previousRequestGotZeroResults = true;
      } else {
        this.previousRequestGotZeroResults = false;
      }
      this.loading = false;
    }, () => {
        this.loading = false;
    });
  }

  public fetchNextChunk(skip: number, limit: number): Promise<IntegrationResource[]> {
    return this.dataService.getResourcesPaged(this.containerType, this.containerUri, this.language, limit.toString(), skip.toString(),
      this.status$.value, this.search$.value, this.restricts.join(','));
  }

  emitSelectResourceEvent(resource: IntegrationResource) {
    this.selectResourceEvent.emit(resource);
  }

}