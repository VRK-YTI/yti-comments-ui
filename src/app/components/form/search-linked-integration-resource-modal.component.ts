import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entity/integration-resource';
import { containerTypes } from '../common/containertypes';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import { regularStatuses, Status } from 'yti-common-ui/entities/status';
import { IntegrationResourceType } from '../../services/api-schema';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-search-linked-source-modal',
  templateUrl: './search-linked-integration-resource-modal.component.html',
  styleUrls: ['./search-linked-integration-resource-modal.component.scss']
})
export class SearchLinkedIntegrationResourceModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() useUILanguage: boolean;
  @Input() containerUri: string | null;
  @Input() containerType: string | null;
  @Input() restrictResourceUris: string[];
  @Input() openThreads: boolean | null;

  statusOptions: FilterOptions<Status>;
  containerTypeOptions: FilterOptions<string>;

  resources$: Observable<IntegrationResource[]>;
  resources: IntegrationResource[];

  status$ = new BehaviorSubject<Status | null>(null);
  containerType$ = new BehaviorSubject<string | null>(null);
  search$ = new BehaviorSubject('');
  searchResults$ = new BehaviorSubject<IntegrationResource[]>([]);

  loading = false;

  constructor(public configurationService: ConfigurationService,
              public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private translateService: TranslateService) {
  }

  ngOnInit() {

    this.containerTypeOptions = [null, ...containerTypes].map(containerType => ({
      value: containerType,
      name: () => this.translateService.instant(containerType ? containerType : 'Select tool'),
      idIdentifier: () => containerType ? containerType : 'select_source_container_type'
    }));

    this.statusOptions = [null, ...regularStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    if (this.containerUri && this.containerType) {
      this.resources$ = this.dataService.getResources(this.containerType, this.containerUri, this.languageService.language);
      this.filterResources();
    } else {
      this.containerType$.subscribe(selectedContainerType => {
        if (selectedContainerType != null) {
          this.resources$ = this.dataService.getContainers(selectedContainerType, this.languageService.language);
          this.filterResources();
        }
      });
    }
  }

  get hasContent(): boolean {

    return this.searchResults$.getValue().length > 0;
  }

  get hasContainerType(): boolean {

    return this.containerType$.getValue() != null || this.containerType != null;
  }

  filterResources() {

    this.loading = true;

    this.searchResults$.next([]);

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    combineLatest(this.resources$, this.status$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([integrationResources, status, search]) => {
          return integrationResources.filter(integrationResource => {
            const label = this.languageService.translate(integrationResource.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, integrationResource.uri);
            const statusMatches = !status || integrationResource.status === status;
            return searchMatches && isNotRestricted && statusMatches;
          });
        })
      ).subscribe(results => {
      this.searchResults$.next(results);
    });
  }

  select(resource: IntegrationResource) {

    resource.type = this.containerType$.value ? this.containerType$.value : undefined;
    this.modal.close(resource);
  }

  ngAfterViewInit() {

    this.searchInput.nativeElement.focus();
  }

  get search() {

    return this.search$.getValue();
  }

  set search(value: string) {

    this.search$.next(value);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }

  createEmptyResource() {

    const integrationResourceType: IntegrationResourceType = <IntegrationResourceType>{
      type: this.containerType
    };
    const resource: IntegrationResource = new IntegrationResource(integrationResourceType);
    this.modal.close(resource);
  }
}

@Injectable()
export class SearchLinkedIntegrationResourceModalService {

  constructor(private modalService: ModalService) {
  }

  open(containerType: string | null,
       containerUri: string | null,
       openThreads: boolean | null,
       titleLabel: string,
       searchLabel: string,
       restrictResourceUris: string[],
       useUILanguage: boolean = false): Promise<IntegrationResource> {

    const modalRef = this.modalService.open(SearchLinkedIntegrationResourceModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as SearchLinkedIntegrationResourceModalComponent;
    instance.containerType = containerType;
    instance.containerUri = containerUri;
    instance.openThreads = openThreads;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictResourceUris;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
