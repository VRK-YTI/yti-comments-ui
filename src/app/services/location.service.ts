import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Location } from 'yti-common-ui/types/location';
import { CommentRound } from '../entity/commentround';
import { Comment } from '../entity/comment';
import { CommentThread } from '../entity/commentthread';

const frontPage = { localizationKey: 'Front page', route: [''] };
const informationAboutServicePage = { localizationKey: 'Information about the service', route: ['information'] };
const createCommentRoundPage = { localizationKey: 'Create comment round', route: ['createcommentround'] };
const createCommentThreadPage = { localizationKey: 'Create comment thread', route: ['createcommentthread'] };
const createCommentPage = { localizationKey: 'Create comment', route: ['createcomment'] };

@Injectable()
export class LocationService {

  location = new Subject<Location[]>();

  private changeLocation(location: Location[]): void {
    location.unshift(frontPage);
    this.location.next(location);
  }

  atFrontPage(): void {
    this.changeLocation([]);
  }

  atCommentRoundPage(commentRound: CommentRound): void {
    this.changeLocation(commentRound.location);
  }

  atCommentThreadPage(commentThread: CommentThread): void {
    this.changeLocation(commentThread.location);
  }

  atCommentPage(comment: Comment): void {
    this.changeLocation(comment.location);
  }

  atCommentRoundCreatePage(): void {
    this.changeLocation([createCommentRoundPage]);
  }

  atCommentThreadCreatePage(commentRound: CommentRound): void {
    this.changeLocation([...commentRound.location, createCommentThreadPage]);
  }

  atCommentCreatePage(commentThread: CommentThread): void {
    this.changeLocation([...commentThread.location, createCommentPage]);
  }

  atUserDetails(): void {
    this.changeLocation([{
      localizationKey: 'User details',
      route: ['userdetails']
    }]);
  }

  atInformationAboutService(): void {
    this.changeLocation([informationAboutServicePage]);
  }
}
