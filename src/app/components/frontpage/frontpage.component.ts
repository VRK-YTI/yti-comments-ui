import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommentRound } from '../../entity/commentround';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { Organization } from '../../entity/organization';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import { allCommentRoundStatuses, CommentRoundStatus } from '../../entity/comment-round-status';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { labelNameToResourceIdIdentifier } from 'yti-common-ui/utils/resource';
import { LanguageService } from '../../services/language.service';
import { Option } from 'yti-common-ui/components/dropdown.component';
import { OrganizationSimple } from '../../entity/organization-simple';
import { flatMap, tap } from 'rxjs/operators';
import { containerTypes } from '../common/containertypes';
import { SearchLinkedIntegrationResourceModalService } from '../form/search-linked-integration-resource-modal.component';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { IntegrationResource } from '../../entity/integration-resource';
import { IntegrationResourceService } from '../../services/integrationresource.service';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.scss']
})
export class FrontpageComponent implements OnInit, OnDestroy {

  commentRounds: CommentRound[];

  searchInProgress = true;

  statusOptions: FilterOptions<CommentRoundStatus>;
  organizationOptions: FilterOptions<OrganizationSimple>;
  containerTypeOptions: FilterOptions<string>;

  status$ = new BehaviorSubject<CommentRoundStatus | null>(null);
  organization$ = new BehaviorSubject<Organization | null>(null);
  containerType$ = new BehaviorSubject<string | null>(null);

  private subscriptionToClean: Subscription[] = [];

  fullDescription: { [key: string]: boolean } = {};

  constructor(private dataService: DataService,
              private integrationResourceService: IntegrationResourceService,
              private locationService: LocationService,
              private authorizationManager: AuthorizationManager,
              private router: Router,
              private translateService: TranslateService,
              private languageService: LanguageService,
              private searchLinkedIntegrationResourceModalService: SearchLinkedIntegrationResourceModalService) {

    locationService.atFrontPage();
  }

  ngOnInit() {

    this.subscriptionToClean.push(combineLatest(this.dataService.getOrganizationsWithCommentRounds(), this.languageService.language$)
      .subscribe(([organizations]) => {
        this.organizationOptions = [null, ...organizations].map(organization => ({
          value: organization,
          name: () => organization ? this.languageService.translate(organization.prefLabel, true)
            : this.translateService.instant('All organizations'),
          idIdentifier: () => organization ? labelNameToResourceIdIdentifier(this.languageService.translate(organization.prefLabel, true))
            : 'all_selected'
        }));
        this.organizationOptions.sort(comparingLocalizable<Option<Organization>>(this.languageService, c =>
          c.value ? c.value.prefLabel : {}));
      }));

    this.statusOptions = [null, ...allCommentRoundStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    this.containerTypeOptions = [null, ...containerTypes].map(containerType => ({
      value: containerType,
      name: () => this.translateService.instant(containerType ? containerType : 'All tools'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    combineLatest(this.status$, this.organization$, this.containerType$)
      .pipe(
        tap(() => this.searchInProgress = true),
        flatMap(([status, organization, containerType]) => {
          const organizationId = organization ? organization.id : null;

          return this.dataService.getCommentRounds(organizationId, status, containerType);
        }),
        tap(() => this.searchInProgress = false)
      )
      .subscribe(results => this.commentRounds = results);
  }

  get loading(): boolean {

    return this.commentRounds == null;
  }

  canCreateCommentRound() {

    return this.authorizationManager.canCreateCommentRound();
  }

  storeSourceAndNavigateToCreateCommentRound(integrationResource: IntegrationResource) {

    this.integrationResourceService.addIntegrationResource(integrationResource);

    this.router.navigate([
      'createcommentround',
      {
        integrationResourceUri: integrationResource.uri
      }
    ]);

  }

  createNewCommentRound() {

    const titleLabel = this.translateService.instant('Choose source');
    const searchlabel = this.translateService.instant('Search term');

    this.searchLinkedIntegrationResourceModalService
      .open(null, null, null, titleLabel, searchlabel, [], true)
      .then(source => this.storeSourceAndNavigateToCreateCommentRound(source), ignoreModalClose);
  }

  ngOnDestroy(): void {

    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  toggleFullDescription(commentRoundId: string) {

    if (this.fullDescription[commentRoundId]) {
      delete this.fullDescription[commentRoundId];
    } else {
      this.fullDescription[commentRoundId] = true;
    }
  }
}
