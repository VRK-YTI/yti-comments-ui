import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Comment } from '../entity/comment';
import { CommentRound } from '../entity/commentround';
import { CommentRoundType, CommentType, GlobalCommentsType } from './api-schema';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators';
import { GlobalComments } from '../entity/globalcomments';

const apiContext = 'comments-api';
const api = 'api';
const version = 'v1';
const commentRounds = 'commentrounds';
const globalComments = 'globalcomments';
const comments = 'comments';

const baseApiPath = `/${apiContext}/${api}/${version}`;
const commentsApiPath = `${baseApiPath}/${comments}`;
const commentRoundsApiPath = `${baseApiPath}/${commentRounds}`;
const globalCommentsApiPath = `${baseApiPath}/${globalComments}`;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) {
  }

  getGlobalComments(): Observable<CommentRound[]> {
    const params = new HttpParams()
      .set('expand', 'source');

    return this.http.get(globalCommentsApiPath, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: GlobalCommentsType) => new GlobalComments(data));
      }));
  }

  getSingleGlobalComments(globalCommentsId: string): Observable<GlobalComments> {
    const params = new HttpParams()
      .set('expand', 'source');

    return this.http.get(globalCommentsApiPath + '/' + globalCommentsId, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return new GlobalComments(res as GlobalCommentsType);
      }));
  }

  getGlobalCommentsComments(globalCommentsId: string): Observable<Comment[]> {
    return this.http.get(globalCommentsApiPath + '/' + globalCommentsId + '/' + comments, { responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentType) => new Comment(data));
      }));
  }

  getCommentRounds(): Observable<CommentRound[]> {
    const params = new HttpParams()
      .set('expand', 'source');

    return this.http.get(commentRoundsApiPath, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentRoundType) => new CommentRound(data));
      }));
  }

  getCommentRound(commentRoundId: string): Observable<CommentRound> {
    const params = new HttpParams()
      .set('expand', 'source');

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return new CommentRound(res as CommentRoundType);
      }));
  }

  getCommentRoundComments(commentRoundId: string): Observable<Comment[]> {
    return this.http.get(commentRoundsApiPath + '/' + commentRoundId + '/' + comments, { responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentType) => new Comment(data));
      }));
  }

  getComment(commentId: string): Observable<Comment> {
    return this.http.get(commentsApiPath + '/' + commentId, { responseType: 'json' })
      .pipe(map((res: any) => {
        return new Comment(res as CommentType);
      }));
  }
}
