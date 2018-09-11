import { Component, Input, OnInit } from '@angular/core';
import { Comment } from '../entity/comment';
import { DataService } from '../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  @Input() commentRoundId: string;
  @Input() globalCommentsId: string;

  comments: Comment[];

  constructor(private dataService: DataService,
              private router: Router) { }

  ngOnInit() {
    if (this.commentRoundId) {
      this.dataService.getCommentRoundComments(this.commentRoundId).subscribe(comments => {
        this.comments = comments;
      });
    } else if (this.globalCommentsId) {
      this.dataService.getGlobalCommentsComments(this.globalCommentsId).subscribe(comments => {
        this.comments = comments;
      });
    }
  }

  get loading(): boolean {
    return this.comments == null;
  }

  viewComment(comment: Comment) {
    console.log('View comment: ' + comment.id);
    this.router.navigate([
      'comment',
      {
        commentId: comment.id
      }
    ]);
  }
}
