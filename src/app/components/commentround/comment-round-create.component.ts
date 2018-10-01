import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { CommentRoundStatus } from '../../entity/comment-round-status';
import { Location } from '@angular/common';
import { formatDate, validDateRange } from '../../utils/date';
import { requiredList } from 'yti-common-ui/utils/validator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { Organization } from '../../entity/organization';
import { CommentRoundType, SourceType } from '../../services/api-schema';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-commentround-create',
  templateUrl: './comment-round-create.component.html',
  styleUrls: ['./comment-round-create.component.scss'],
  providers: [EditableService]
})
export class CommentRoundCreateComponent implements OnInit {

  env: string;

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    fixedThreads: new FormControl(true),
    openThreads: new FormControl(false),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('AWAIT' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList]),
    resource: new FormControl(null)
  }, null);

  constructor(private router: Router,
              private dataService: DataService,
              private editableService: EditableService,
              private activatedRoute: ActivatedRoute,
              private location: Location,
              private languageService: LanguageService,
              private locationService: LocationService) {

    editableService.onSave = (formValue: any) => this.save(formValue);
    editableService.cancel$.subscribe(() => this.back());
    this.editableService.edit();
  }

  ngOnInit() {

    this.dataService.getServiceConfiguration().subscribe(configuration => {
      this.env = configuration.env;
    });

    this.locationService.atCommentRoundCreatePage();
  }

  get loading(): boolean {
    return this.env == null;
  }

  back() {
    this.location.back();
  }

  save(formData: any): Observable<any> {

    const { label, description, fixedThreads, openThreads, validity, organizations, resource, status } = formData;

    const source: SourceType = <SourceType> {
      'containerType': 'codelist',
      'containerUri': resource.uri
    };

    const commentRound: CommentRoundType = <CommentRoundType> {
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      startDate: formatDate(validity.start),
      endDate: formatDate(validity.end),
      organizations: organizations.map((organization: Organization) => organization.serialize()),
      source: source,
      sourceLabel: resource.prefLabel,
      status: status
    };

    const save = () => {
      return this.dataService.createCommentRound(commentRound)
        .pipe(tap(createdCommentRound => {
          this.router.navigate(createdCommentRound.route);
        }));
    };

    return save();
  }

  get getResourceUri(): string {

    return this.commentRoundForm.controls['resource'].value ? this.commentRoundForm.controls['resource'].value.uri : '-';
  }
}
