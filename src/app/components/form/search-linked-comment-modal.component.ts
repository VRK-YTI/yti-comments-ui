import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { DataService } from '../../services/data.service';
import { CommentSimple } from '../../entity/comment-simple';
import { CommentThread } from '../../entity/commentthread';
import { CommentRound } from '../../entity/commentround';

@Component({
  selector: 'app-search-linked-comment-modal',
  styleUrls: ['./search-linked-comment-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div class="row mb-2">
        <div class="col-12">
          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_comment_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>
        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div id="{{comment.id + '_comment_link'}}"
                   class="search-result"
                   *ngFor="let comment of searchResults$ | async; let last = last"
                   (click)="select(comment)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="comment.content"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">

      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()">
        <span translate>Cancel</span>
      </button>
    </div>
  `
})
export class SearchLinkedCommentModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() useUILanguage: boolean;
  @Input() commentThread: CommentThread;
  @Input() commentRound: CommentRound;

  comments$: Observable<CommentSimple[]>;
  searchResults$: Observable<CommentSimple[]>;

  search$ = new BehaviorSubject('');
  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService) {
  }

  ngOnInit() {

    this.updateComments();
  }

  select(comment: CommentSimple) {

    this.modal.close(comment);
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

  filterComments() {

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.comments$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([comments, search]) => {
          return comments.filter(comment => {
            const label = comment.content;
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, comment.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  updateComments() {

    this.comments$ = this.dataService.getCommentRoundCommentThreadComments(
      this.commentRound.id,
      this.commentThread.id);
    this.filterComments();
  }
}

@Injectable()
export class SearchLinkedCommentModalService {

  constructor(private modalService: ModalService) {
  }

  openWithCommentRoundAndCommentThread(commentRound: CommentRound,
                                       commentThread: CommentThread,
                                       titleLabel: string,
                                       searchLabel: string,
                                       restrictCodeIds: string[],
                                       useUILanguage: boolean = false): Promise<CommentSimple> {

    const modalRef = this.modalService.open(SearchLinkedCommentModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedCommentModalComponent;
    instance.commentRound = commentRound;
    instance.commentThread = commentThread;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictCodeIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
