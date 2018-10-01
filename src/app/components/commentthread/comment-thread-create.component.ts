import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { CommentThreadType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';
import { CommentRound } from '../../entity/commentround';

@Component({
  selector: 'app-commentthread-create',
  templateUrl: './comment-thread-create.component.html',
  styleUrls: ['./comment-thread-create.component.scss'],
  providers: [EditableService]
})
export class CommentThreadCreateComponent implements OnInit {

  env: string;
  commentRound: CommentRound;

  commentThreadForm = new FormGroup({
    label: new FormControl({}),
    definition: new FormControl({}),
    proposedText: new FormControl(''),
    proposedStatus: new FormControl('NOSTATUS'),
    resource: new FormControl(null)
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

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.locationService.atCommentThreadCreatePage(this.commentRound);
    });

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });
  }

  get loading(): boolean {
    return this.env == null || this.commentRound == null;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { id, url, label, definition, proposedStatus, proposedText, resource } = formData;

    const commentThread: CommentThreadType = <CommentThreadType> {
      id: id,
      url: url,
      label: label,
      definition: definition,
      proposedStatus: proposedStatus !== 'NOSTATUS' ? proposedStatus : null,
      proposedText: proposedText,
      resourceUri: resource.uri,
      commentRound: this.commentRound.serialize()
    };

    const save = () => {
      return this.dataService.createCommentThread(commentThread)
        .pipe(tap(createdCommentThread => {
          this.router.navigate([
            'commentthread',
            {
              commentRoundId: this.commentRound.id,
              commentThreadId: createdCommentThread.id
            }
          ]);
        }));
    };

    return save();
  }
}
