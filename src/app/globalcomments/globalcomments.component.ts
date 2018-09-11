import { Component, OnInit } from '@angular/core';
import { CommentRound } from '../entity/commentround';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-globalcomments',
  templateUrl: './globalcomments.component.html',
  styleUrls: ['./globalcomments.component.css']
})
export class GlobalCommentsComponent implements OnInit {

  globalComments: CommentRound[];

  constructor(private dataService: DataService) { }

  ngOnInit() {

    this.dataService.getGlobalComments().subscribe(globalComments => {
      this.globalComments = globalComments;
    });
  }

  get loading(): boolean {
    return this.globalComments == null;
  }
}
