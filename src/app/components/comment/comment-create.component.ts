import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { CommentType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { CommentRound } from '../../entity/commentround';
import { CommentThread } from '../../entity/commentthread';

@Component({
  selector: 'app-comment-create',
  templateUrl: './comment-create.component.html',
  styleUrls: ['./comment-create.component.scss'],
  providers: [EditableService]
})
export class CommentCreateComponent implements OnInit {

  env: string;
  commentThread: CommentThread;
  commentRound: CommentRound;

  commentForm = new FormGroup({
    content: new FormControl(''),
    proposedStatus: new FormControl('NOSTATUS'),
    parentComment: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService,
              private route: ActivatedRoute) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    const commentRoundId = this.route.snapshot.params.commentRoundId;
    const commentThreadId = this.route.snapshot.params.commentThreadId;

    if (!commentRoundId || !commentThreadId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}', commentThread: '${commentThreadId}'`);
    }

    this.dataService.getCommentRoundCommentThread(commentRoundId, commentThreadId).subscribe(commentThread => {
      this.commentThread = commentThread;
      this.locationService.atCommentCreatePage(this.commentThread);
    });

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
    });

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  get loading(): boolean {
    return this.env == null || this.commentRound == null || this.commentThread == null;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { id, url, content, proposedStatus, parentComment } = formData;

    const comment: CommentType = <CommentType> {
      id: id,
      url: url,
      content: content,
      proposedStatus: proposedStatus !== 'NOSTATUS' ? proposedStatus : null,
      parentComment: parentComment,
      commentThread: this.commentThread.serialize()
    };

    const save = () => {
      return this.dataService.createComment(this.commentRound.id, comment)
        .pipe(tap(createdComment => {
          this.router.navigate([
            'comment',
            {
              commentRoundId: this.commentRound.id,
              commentThreadId: this.commentThread.id,
              commentId: createdComment.id
            }
          ]);
        }));
    };

    return save();
  }
}
