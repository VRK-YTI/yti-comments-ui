import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FrontpageComponent } from './components/frontpage/frontpage.component';
import { ResolveEnd, Route, Router, RouterModule, Routes, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { of } from 'rxjs';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClientModule } from '@angular/common/http';
import { CommentComponent } from './components/comment/comment.component';
import { CommentRoundComponent } from './components/commentround/comment-round.component';
import { NavigationBarComponent } from './components/navigation/navigation-bar.component';
import { LogoComponent } from './components/navigation/logo.component';
import { DataService } from './services/data.service';
import { LocationService } from './services/location.service';
import { LanguageService } from './services/language.service';
import { AUTHENTICATED_USER_ENDPOINT } from 'yti-common-ui/services/user.service';
import { LOCALIZER, YtiCommonModule } from 'yti-common-ui';
import { CommentThreadComponent } from './components/commentthread/comment-thread.component';
import { InformationAboutServiceComponent } from './components/information/information-about-service.component';
import { ModalService } from './services/modal.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsComponent } from './components/userdetails/user-details.component';
import { RefreshComponent } from './refresh.component';
import { CommentRoundCreateComponent } from './components/commentround/comment-round-create.component';
import { EditableButtonsComponent } from './components/form/editable-buttons.component';
import { ErrorMessagesComponent } from './components/form/error-messages.component';
import { OrganizationsInputComponent } from './components/form/organizations-input.compontent';
import { LocalizableLiteralComponent } from './components/form/localizable-literal';
import { LocalizableTextareaInputComponent } from './components/form/localizable-textarea-input';
import { LiteralComponent } from './components/form/literal';
import { LiteralInputComponent } from './components/form/literal-input';
import { LinkComponent } from './components/form/link';
import { CommentRoundStatusInputComponent } from './components/form/comment-round-status-input.component';
import { DateInputComponent } from './components/form/date-input.component';
import { DateRangeInputComponent } from './components/form/date-range-input.component';
import { SourceInputComponent } from './components/form/source-input.component';
import {
  SearchLinkedIntegrationResourceModalComponent,
  SearchLinkedIntegrationResourceModalService
} from './components/form/search-linked-integration-resource-modal.component';
import { CommentRoundErrorModalService } from './components/common/error-modal.service';
import {
  SearchLinkedOrganizationModalComponent,
  SearchLinkedOrganizationModalService
} from './components/form/search-linked-organization-modal.component';
import { ContentLanguageComponent } from './components/common/content-language-component';
import { AuthorizationManager } from './services/authorization-manager';
import { CommentRoundStatusDropdownComponent } from './components/form/comment-round-status-dropdown.component';
import { CommentRoundListitemComponent } from './components/commentround/comment-round-listitem.component';
import { BooleanInputComponent } from './components/form/boolean-input-component';
import { CommentThreadCreateComponent } from './components/commentthread/comment-thread-create.component';
import { LocalizableInputComponent } from './components/form/localizable-input';
import { CommentCreateComponent } from './components/comment/comment-create.component';
import { CommentInputComponent } from './components/form/parent-comment-input';
import {
  SearchLinkedCommentModalComponent,
  SearchLinkedCommentModalService
} from './components/form/search-linked-comment-modal.component';
import { ProposedStatusInputComponent } from './components/form/proposed-status-input.component';
import { ProposedStatusDropdownComponent } from './components/form/proposedstatus-dropdown-component';
import { CommentRoundStatusComponent } from './components/form/comment-round-status.component';
import { LiteralTextareaComponent } from './components/form/literal-textarea';
import { LocalizableTextareaComponent } from './components/form/localizable-textarea';
import { ClipboardComponent } from './components/form/clipboard';
import { ClipboardModule } from 'ngx-clipboard';
import { CurrentStatusComponent } from './components/form/current-status';
import { ProposedStatusTableDropdownComponent } from './components/form/proposed-status-dropdown';
import { IntegrationResourceService } from './services/integrationresource.service';
import { CommentsConfirmationModalService } from './components/common/confirmation-modal.service';
import { DiscussionModalComponent, DiscussionModalService } from './components/common/discussion-modal.service';
import { HierarchicalCommentListitemComponent } from './components/common/hierarchical-comment-listitem.component';
import { LiteralMultilanguageComponent } from './components/form/literal-multilanguage';
import { ConfigurationService } from './services/configuration.service';
import { CommentRoundDateRangeInputComponent } from './components/form/app-comment-round-date-range.component';
import { AutosizeModule } from 'ngx-autosize';
import { LocalizableUndefinedTextareaComponent } from './components/form/literal-und-textarea';

declare var require: any;

function removeEmptyValues(obj: {}) {

  const result: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (!!value) {
      result[key] = value;
    }
  }

  return result;
}

const localizations: { [lang: string]: any } = {
  fi: {
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!../../po/fi.po`))),
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!yti-common-ui/po/fi.po`)))
  },
  en: {
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!../../po/en.po`))),
    ...removeEmptyValues(JSON.parse(require(`raw-loader!po-loader?format=mf!yti-common-ui/po/en.po`)))
  }
};

export function refreshRouteMatcher(segments: UrlSegment[], group: UrlSegmentGroup, route: Route) {
  if (segments.length >= 1 && segments[0].path === 're') {
    return {
      consumed: segments
    };
  }
  return {
    consumed: []
  };
}

export function initApp(configurationService: ConfigurationService) {
  return () => configurationService.fetchConfiguration();
}

export function resolveAuthenticatedUserEndpoint() {
  return '/comments-api/api/authenticated-user';
}

export function createTranslateLoader(): TranslateLoader {
  return { getTranslation: (lang: string) => of(localizations[lang]) };
}

export function createMissingTranslationHandler(): MissingTranslationHandler {
  return {
    handle: (params: MissingTranslationHandlerParams) => {
      if (params.translateService.currentLang === 'en') {
        return params.key;
      } else {
        return '[MISSING]: ' + params.key;
      }
    }
  };
}

const appRoutes: Routes = [
  { path: '', component: FrontpageComponent, pathMatch: 'full' },
  { path: 'frontpage', redirectTo: '/', pathMatch: 'full' },
  { path: 'commentround', component: CommentRoundComponent, pathMatch: 'full' },
  { path: 'createcommentround', component: CommentRoundCreateComponent, pathMatch: 'full' },
  { path: 'commentthread', component: CommentThreadComponent, pathMatch: 'full' },
  { path: 'createcommentthread', component: CommentThreadCreateComponent, pathMatch: 'full' },
  { path: 'comment', component: CommentComponent, pathMatch: 'full' },
  { path: 'createcomment', component: CommentCreateComponent, pathMatch: 'full' },
  { path: 'information', component: InformationAboutServiceComponent },
  { path: 'userdetails', component: UserDetailsComponent },
  // NOTE: If createRefreshRouteMatcher(['re']) starts to work after angular upgrade, then switch to that.
  { matcher: refreshRouteMatcher, component: RefreshComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    FrontpageComponent,
    CommentComponent,
    CommentRoundComponent,
    NavigationBarComponent,
    LogoComponent,
    CommentThreadComponent,
    InformationAboutServiceComponent,
    UserDetailsComponent,
    RefreshComponent,
    CommentRoundCreateComponent,
    EditableButtonsComponent,
    ErrorMessagesComponent,
    OrganizationsInputComponent,
    LocalizableLiteralComponent,
    LocalizableTextareaInputComponent,
    LocalizableTextareaComponent,
    ClipboardComponent,
    LiteralInputComponent,
    LiteralComponent,
    LinkComponent,
    CommentRoundStatusInputComponent,
    DateRangeInputComponent,
    DateInputComponent,
    SourceInputComponent,
    SearchLinkedIntegrationResourceModalComponent,
    SearchLinkedOrganizationModalComponent,
    DiscussionModalComponent,
    ContentLanguageComponent,
    CommentRoundStatusDropdownComponent,
    CommentRoundListitemComponent,
    CommentThreadCreateComponent,
    CommentCreateComponent,
    BooleanInputComponent,
    LocalizableInputComponent,
    CommentInputComponent,
    SearchLinkedCommentModalComponent,
    ProposedStatusInputComponent,
    ProposedStatusDropdownComponent,
    CommentRoundStatusComponent,
    LiteralTextareaComponent,
    CurrentStatusComponent,
    ProposedStatusTableDropdownComponent,
    HierarchicalCommentListitemComponent,
    LiteralMultilanguageComponent,
    CommentRoundDateRangeInputComponent,
    LocalizableUndefinedTextareaComponent
  ],
  entryComponents: [
    SearchLinkedIntegrationResourceModalComponent,
    SearchLinkedOrganizationModalComponent,
    SearchLinkedCommentModalComponent,
    DiscussionModalComponent
  ],
  imports: [
    YtiCommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
    NgbModule.forRoot(),
    ClipboardModule,
    AutosizeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader
      },
      missingTranslationHandler: { provide: MissingTranslationHandler, useFactory: createMissingTranslationHandler },
    })
  ],
  providers: [
    { provide: APP_INITIALIZER, useFactory: initApp, deps: [ConfigurationService], multi: true },
    { provide: AUTHENTICATED_USER_ENDPOINT, useFactory: resolveAuthenticatedUserEndpoint },
    { provide: LOCALIZER, useExisting: LanguageService },
    LanguageService,
    LocationService,
    AuthorizationManager,
    DataService,
    IntegrationResourceService,
    CommentsConfirmationModalService,
    ModalService,
    SearchLinkedIntegrationResourceModalService,
    SearchLinkedOrganizationModalService,
    SearchLinkedCommentModalService,
    DiscussionModalService,
    CommentRoundErrorModalService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(router: Router,
              modalService: ModalService) {

    router.events.subscribe(event => {
      if (event instanceof ResolveEnd) {
        modalService.closeAllModals();
      }
    });
  }
}
