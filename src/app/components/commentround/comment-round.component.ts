import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entity/commentround';
import { Comment } from '../../entity/comment';
import { DataService } from '../../services/data.service';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { LanguageService } from '../../services/language.service';
import { ConfigurationService } from '../../services/configuration.service';
import { NgbTabChangeEvent, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { CommentRoundErrorModalService } from '../common/error-modal.service';
import { EditableService } from '../../services/editable.service';
import { CommentThreadSimple } from '../../entity/commentthread-simple';

@Component({
  selector: 'app-commentround',
  templateUrl: './comment-round.component.html',
  styleUrls: ['./comment-round.component.scss'],
  providers: [EditableService]
})
export class CommentRoundComponent implements OnInit {

  @ViewChild('tabSet') tabSet: NgbTabset;

  commentRound: CommentRound;
  commentThreads: CommentThreadSimple[];
  myComments: Comment[];

  constructor(public languageService: LanguageService,
              public configurationService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentRoundErrorModalService,
              private editableService: EditableService) {
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.locationService.atCommentRoundPage(commentRound);
    });

    this.dataService.getCommentRoundCommenterComments(commentRoundId).subscribe(comments => {
      this.myComments = comments;
    });

    this.dataService.getCommentRoundCommentThreads(commentRoundId).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  get showStartCommenting() {

    return (this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS' &&
      this.tabSet && this.tabSet.activeId !== 'commentround_comments_tab');
  }

  goToOwnComments() {

    this.tabSet.activeId = 'commentround_comments_tab';
  }

  goToResources() {

    this.tabSet.activeId = 'commentround_resources_tab';
  }

  startCommentRound() {

    this.confirmationModalService.startCommentRound()
      .then(() => {
        this.commentRound.status = 'INPROGRESS';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.commentRound = new CommentRound(commentRound);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  closeCommentRound() {

    this.confirmationModalService.closeCommentRound()
      .then(() => {
        this.commentRound.status = 'CLOSED';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.commentRound = new CommentRound(commentRound);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  deleteCommentRound() {

    this.confirmationModalService.deleteCommentRound()
      .then(() => {
        this.dataService.deleteCommentRound(this.commentRound).subscribe(commentRound => {
          this.router.navigate(['frontpage']);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  get loading() {

    return this.commentRound == null || this.myComments == null || this.commentThreads == null;
  }

  get isEditorOrSuperUser(): boolean {

    return this.authorizationManager.user.superuser || this.commentRound.user.email === this.authorizationManager.user.email;
  }

  get toolType(): string {

    return this.commentRound.source.containerType;
  }

  onTabChange(event: NgbTabChangeEvent) {

    if (this.editing) {
      event.preventDefault();
      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.cancelEditing();
          this.tabSet.activeId = event.nextId;
        }, ignoreModalClose);
    } else {
      this.tabSet.activeId = event.nextId;
    }
  }

  get canStartCommentRound(): boolean {

    return this.commentRound.status === 'INCOMPLETE' && this.commentRound.commentThreads && this.commentRound.commentThreads.length > 0 &&
      !this.editing && this.isEditorOrSuperUser;
  }

  get canEndCommenting(): boolean {

    return this.commentRound.status === 'INPROGRESS' && this.isEditorOrSuperUser;
  }

  get canDeleteCommentRound(): boolean {

    return this.authorizationManager.canDeleteCommentRound(this.commentRound);
  }

  get showExcelExport(): boolean {

    return this.commentRound.status === 'ENDED' || this.commentRound.status === 'CLOSED';
  }

  get exportUrl(): string {

    return this.commentRound.url + '/?format=excel';
  }

  get showMenu(): boolean {

    return this.isEditorOrSuperUser;
  }

  cancelEditing(): void {

    this.editableService.cancel();
  }

  get editing() {

    return this.editableService.editing;
  }

  refreshCommentRound() {

    this.dataService.getCommentRound(this.commentRound.id).subscribe(commentRound => {
      this.commentRound = commentRound;
    });
  }

  refreshCommentThreads() {

    this.dataService.getCommentRoundCommentThreads(this.commentRound.id).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  refreshMyComments() {

    this.dataService.getCommentRoundCommenterComments(this.commentRound.id).subscribe(comments => {
      this.myComments = comments;
      this.goToResources();
    });
  }
}
