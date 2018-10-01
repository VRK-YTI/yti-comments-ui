import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CommentRound } from '../../entity/commentround';

@Component({
  selector: 'app-comment-round-listitem',
  styleUrls: ['./comment-round-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_commentround'}}">
      <app-commentround-status class="status"
                               [status]="commentRound.status"></app-commentround-status>
      <a class="name" [routerLink]="commentRound.route">{{ commentRound.label }}</a>
      <div class="description-container"
           style="width: calc(100% - 260px);"
           [ngClass]="{ 'expand': fullDescription[commentRound.id] }">
        <span class="description">{{ commentRound.description }}</span>
        <div class="limiter-container">
          <div class="description-limiter" (click)="toggleFullDescription(commentRound.id)"></div>
        </div>
      </div>

      <ul class="organizations dot-separated-list">
        <li class="organization" *ngFor="let org of commentRound.organizations">
          {{org.prefLabel | translateValue:true}}
        </li>
      </ul>

      <a class="uri">{{ commentRound.source.containerUri }}</a>
    </div>
  `
})

export class CommentRoundListitemComponent {

  @Output() toggleDescriptionFunction = new EventEmitter<string>();
  @Input() commentRound: CommentRound;
  @Input() fullDescription: { [key: string]: boolean };

  constructor(private router: Router,
              public languageService: LanguageService) {
  }

  toggleFullDescription(commentRoundId: string) {

    this.toggleDescriptionFunction.emit(commentRoundId);
  }

  getIdIdentifier() {

    return `${this.commentRound.id}`;
  }
}
