import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
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
import { IntegrationResource } from '../../entity/integration-resource';
import { Localizable } from 'yti-common-ui/types/localization';

@Component({
  selector: 'app-commentthread-create',
  templateUrl: './comment-thread-create.component.html',
  styleUrls: ['./comment-thread-create.component.scss'],
  providers: [EditableService]
})
export class CommentThreadCreateComponent implements OnInit {

  env: string;
  commentRound: CommentRound;

  resourceChangeSubscription: Subscription;

  commentThreadForm = new FormGroup({
    label: new FormControl({}),
    description: new FormControl({}),
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

    this.resourceChangeSubscription = this.commentThreadForm.controls['resource'].valueChanges
      .subscribe(data => this.updateResourceData(data));

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

  get allowInput(): boolean {

    return this.getResource == null && this.commentRound.openThreads;
  }

  get loading(): boolean {
    return this.env == null || this.commentRound == null;
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

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { id, url, label, description, proposedStatus, proposedText, resource } = formData;

    const commentThread: CommentThreadType = <CommentThreadType> {
      id: id,
      url: url,
      label: label,
      description: description,
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
