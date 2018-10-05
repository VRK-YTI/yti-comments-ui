import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entity/commentround';
import { DataService } from '../../services/data.service';
import { CommentThread } from '../../entity/commentthread';
import { EditableService } from '../../services/editable.service';
import { FormControl, FormGroup } from '@angular/forms';
import { validDateRange } from '../../utils/date';
import { CommentRoundStatus } from '../../entity/comment-round-status';
import { requiredList } from 'yti-common-ui/utils/validator';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { IntegrationReourceType, SourceType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entity/integration-resource';
import { Source } from '../../entity/source';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentThreadSimple } from '../../entity/commentthread-simple';

@Component({
  selector: 'app-commentround',
  templateUrl: './comment-round.component.html',
  styleUrls: ['./comment-round.component.scss'],
  providers: [EditableService]
})
export class CommentRoundComponent implements OnInit, OnChanges, OnDestroy {

  commentRound: CommentRound;
  commentThreads: CommentThreadSimple[];

  cancelSubscription: Subscription;

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    fixedThreads: new FormControl(),
    openThreads: new FormControl(),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('AWAIT' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList]),
    resource: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private editableService: EditableService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager) {

    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.locationService.atCommentRoundPage(commentRound);
      this.reset();
    });

    this.dataService.getCommentRoundCommentThreads(commentRoundId).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.reset();
  }

  canCreateCommentThread() {

    if (this.commentRound.status === 'AWAIT') {
      return this.authorizationManager.user.email === this.commentRound.user.email;
    } else if (this.commentRound.status === 'INPROGRESS' && !this.commentRound.fixedThreads) {
      return this.authorizationManager.canCreateCommentThread();
    }
    return false;
  }

  createNewCommentThread() {

    this.router.navigate(
      ['createcommentthread',
        {
          commentRoundId: this.commentRound.id
        }
      ]
    );
  }

  private reset() {

    const { label, description, fixedThreads, openThreads, startDate, endDate, organizations, source, sourceLabel, status }
      = this.commentRound;

    const integrationResource: IntegrationReourceType = <IntegrationReourceType> {
      uri: source.containerUri,
      prefLabel: sourceLabel
    };

    const resource: IntegrationResource = new IntegrationResource(integrationResource);

    this.commentRoundForm.reset({
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone()),
      resource: resource,
      status: status
    });
  }

  save(formData: any): Observable<any> {

    const { label, description, fixedThreads, openThreads, validity, organizations, resource, status } = formData;

    const sourceType: SourceType = <SourceType> {
      'id': undefined,
      'url': undefined,
      'containerType': 'codelist',
      'containerUri': resource.uri
    };

    const source: Source = new Source(sourceType);

    const updatedCommentRound = this.commentRound.clone();

    Object.assign(updatedCommentRound, {
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      startDate: validity.start,
      endDate: validity.end,
      organizations: organizations,
      source: source,
      sourceLabel: resource.prefLabel,
      status: status
    });

    const save = () => {
      return this.dataService.updateCommentRound(updatedCommentRound.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    return save();
  }

  get editing() {

    return this.editableService.editing;
  }

  get loading() {

    return this.commentRound == null || this.commentThreads == null;
  }

  get getResourceUri(): string {

    return this.commentRoundForm.controls['resource'].value ? this.commentRoundForm.controls['resource'].value.uri : '-';
  }

  viewCommentThread(commentThread: CommentThread) {

    this.router.navigate([
      'commentthread',
      {
        commentRoundId: this.commentRound.id,
        commentThreadId: commentThread.id
      }
    ]);
  }

  back() {

    this.location.back();
  }
}
