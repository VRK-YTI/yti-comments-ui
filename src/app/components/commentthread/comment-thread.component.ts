import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommentRound } from '../../entity/commentround';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthorizationManager } from '../../services/authorization-manager';
import { EditableService } from '../../services/editable.service';
import { Location } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { CommentThreadType, IntegrationReourceType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { CommentThread } from '../../entity/commentthread';
import { IntegrationResource } from '../../entity/integration-resource';
import { LocationService } from '../../services/location.service';
import { CommentSimple } from '../../entity/comment-simple';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-comment-thread',
  templateUrl: './comment-thread.component.html',
  styleUrls: ['./comment-thread.component.scss'],
  providers: [EditableService]
})
export class CommentThreadComponent implements OnInit {

  commentRound: CommentRound;
  commentThread: CommentThread;
  comments: CommentSimple[];

  cancelSubscription: Subscription;
  resourceChangeSubscription: Subscription;

  commentThreadForm = new FormGroup({
    label: new FormControl({}),
    description: new FormControl({}),
    proposedText: new FormControl(''),
    proposedStatus: new FormControl(''),
    resource: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private authorizationManager: AuthorizationManager,
              private editableService: EditableService,
              private location: Location,
              private locationService: LocationService) {
    this.cancelSubscription = editableService.cancel$.subscribe(() => this.reset());

    this.resourceChangeSubscription = this.commentThreadForm.controls['resource'].valueChanges
      .subscribe(data => this.updateResourceData(data));

    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;
    const commentThreadId = this.route.snapshot.params.commentThreadId;

    if (!commentRoundId || !commentThreadId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}', commentThread: '${commentThreadId}'`);
    }

    this.dataService.getCommentRoundCommentThread(commentRoundId, commentThreadId).subscribe(commentThread => {
      this.commentThread = commentThread;
      this.locationService.atCommentThreadPage(commentThread);
      this.reset();
    });

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
    });

    this.dataService.getCommentRoundCommentThreadComments(commentRoundId, commentThreadId).subscribe(comments => {
      this.comments = comments;
    });
  }

  get loading() {

    return this.commentRound == null || this.commentThread == null || this.comments == null;
  }

  canCreateComment() {

    return this.authorizationManager.canCreateComment();
  }

  createNewComment() {

    this.router.navigate(
      ['createcomment',
        {
          commentRoundId: this.commentRound.id,
          commentThreadId: this.commentThread.id
        }
      ]
    );
  }

  get allowInput(): boolean {

    return this.getResource == null && this.commentRound.openThreads;
  }

  updateResourceData(integrationResource: IntegrationResource) {

    const resource = this.commentThreadForm.controls['resource'].value;
    if (resource) {
      this.commentThreadForm.patchValue({ label : resource.prefLabel });
      this.commentThreadForm.patchValue({ description : resource.description });
    } else {
      this.commentThreadForm.patchValue({ label : {} });
      this.commentThreadForm.patchValue({ description : {} });
    }
  }

  get getLabel(): Localizable {

    const label = this.commentThreadForm.controls['label'].value;
    if (label) {
      return label;
    }
    return {};
  }

  get getDescription(): Localizable {

    const description = this.commentThreadForm.controls['description'].value;
    if (description) {
      return description;
    }
    return {};
  }

  get hasResourceUri(): boolean {

    return !!this.commentThreadForm.controls['resource'].value;
  }

  get getResourceUri(): string {

    return this.commentThreadForm.controls['resource'].value ? this.commentThreadForm.controls['resource'].value.uri : '-';
  }

  get getResource(): IntegrationResource {

    return this.commentThreadForm.controls['resource'].value;
  }

  private reset() {

    const { label, description, resourceUri, proposedStatus, proposedText }
      = this.commentThread;

    const integrationResource: IntegrationReourceType = <IntegrationReourceType> {
      uri: resourceUri,
      prefLabel: label,
      description: description
    };

    const resource: IntegrationResource = new IntegrationResource(integrationResource);

    this.commentThreadForm.reset({
      label: label,
      description: description,
      resource: resource,
      proposedStatus: proposedStatus == null ? 'NOSTATUS' : proposedStatus,
      proposedText: proposedText
    });
  }

  save(formData: any): Observable<any> {

    const { label, description, proposedText, proposedStatus, resource } = formData;

    console.log('label: ' + label.fi);
    console.log('description: ' + description.fi);

    const thisCommentThread = this.commentThread.clone();

    const updatedCommentThreadType: CommentThreadType = <CommentThreadType> {
      id: thisCommentThread.id,
      url: thisCommentThread.url,
      user: thisCommentThread.user.serialize(),
      label: label,
      description: description,
      proposedText: proposedText,
      proposedStatus: proposedStatus !== 'NOSTATUS' ? proposedStatus : null,
      resourceUri: resource.uri,
      created: null,
      commentRound: this.commentRound.serialize()
    };

    const updatedCommentThread: CommentThread = new CommentThread(updatedCommentThreadType);

    console.log('label 2: ' + updatedCommentThread.label.fi);
    console.log('description 2: ' + updatedCommentThread.description.fi);

    const save = () => {
      return this.dataService.updateCommentThread(updatedCommentThread.serialize()).pipe(tap(() => this.ngOnInit()));
    };

    return save();
  }

  get editing() {

    return this.editableService.editing;
  }

  back() {

    this.location.back();
  }
}
