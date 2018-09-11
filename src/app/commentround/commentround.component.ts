import { Component, OnInit } from '@angular/core';
import { Comment } from '../entity/comment';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../entity/commentround';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-commentround',
  templateUrl: './commentround.component.html',
  styleUrls: ['./commentround.component.css']
})
export class CommentRoundComponent implements OnInit {

  commentRound: CommentRound;
  comments: Comment[];

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService) { }

  ngOnInit() {
    const commentRoundId = this.route.snapshot.params.commentRoundId;

    if (!commentRoundId) {
      throw new Error(`Illegal route, commentRound: '${commentRoundId}'`);
    }

    this.dataService.getCommentRound(commentRoundId).subscribe(commentRound => {
      this.commentRound = commentRound;
    });

    this.dataService.getCommentRoundComments(commentRoundId).subscribe(comments => {
      this.comments = comments;
    });
  }

  get loading() {
    return this.commentRound == null || this.comments == null;
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
