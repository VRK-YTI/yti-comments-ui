import { Component, OnInit } from '@angular/core';
import { CommentRound } from '../entity/commentround';
import { DataService } from '../services/data.service';
import { Comment } from '../entity/comment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-commentrounds',
  templateUrl: './commentrounds.component.html',
  styleUrls: ['./commentrounds.component.css']
})
export class CommentRoundsComponent implements OnInit {

  commentRounds: CommentRound[];

  constructor(private dataService: DataService,
              private router: Router) { }

  ngOnInit() {

    this.dataService.getCommentRounds().subscribe(commentRounds => {
      this.commentRounds = commentRounds;
    });
  }

  get loading(): boolean {
    return this.commentRounds == null;
  }

  viewCommentRound(commentRound: CommentRound) {
    console.log('View commentRound: ' + commentRound.id);
    this.router.navigate([
      'commentround',
      {
        commentRoundId: commentRound.id
      }
    ]);
  }
}
