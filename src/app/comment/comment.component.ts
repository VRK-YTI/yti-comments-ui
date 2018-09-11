import { Component, OnInit } from '@angular/core';
import { Comment } from '../entity/comment';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  comment: Comment;

  constructor(private dataService: DataService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const commentId = this.route.snapshot.params.commentId;

    if (!commentId) {
      throw new Error(`Illegal route, comment: '${commentId}'`);
    }

    this.dataService.getComment(commentId).subscribe(comment => {
      this.comment = comment;
    });
  }

  get loading(): boolean {
    return this.comment == null;
  }
}
