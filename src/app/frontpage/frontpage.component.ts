import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { CommentRound } from '../entity/commentround';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.css']
})
export class FrontpageComponent implements OnInit {

  commentRounds: CommentRound[];

  constructor(private dataService: DataService) { }

  ngOnInit() {

    this.dataService.getCommentRounds().subscribe(commentRounds => {
      this.commentRounds = commentRounds;
    });
  }

  get loading(): boolean {
    return this.commentRounds == null;
  }
}
