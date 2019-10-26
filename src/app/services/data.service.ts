import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Comment } from '../entity/comment';
import { CommentRound } from '../entity/commentround';
import {
  ApiResponseType,
  CommentRoundType,
  CommentSimpleType,
  CommentThreadSimpleType,
  CommentThreadType,
  CommentType,
  IntegrationResourceType,
  MessagingUserType,
  OrganizationType,
  SourceType
} from './api-schema';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';
import { ServiceConfiguration } from '../entity/service-configuration';
import { CommentThread } from '../entity/commentthread';
import { UserRequest } from '../entity/userrequest';
import { IntegrationResource } from '../entity/integration-resource';
import { CommentThreadSimple } from '../entity/commentthread-simple';
import { CommentSimple } from '../entity/comment-simple';
import { Source } from '../entity/source';
import { IntegrationRequest } from '../entity/integration-request';
import { AuthorizationManager } from './authorization-manager';
import { SubscriptionRequest } from '../entity/subscription-request';
import { MessagingUser } from '../entity/messaging-user';
import { SubscriptionTypeRequest } from '../entity/subscription-type-request';
import { Organization } from '../entity/organization';

const apiContext = 'comments-api';
const api = 'api';
const version = 'v1';
const sources = 'sources';
const commentRounds = 'commentrounds';
const commentThreads = 'commentthreads';
const configuration = 'configuration';
const comments = 'comments';
const organizations = 'organizations';
const containers = 'containers';
const resources = 'resources';
const fakeableUsers = 'fakeableUsers';
const groupmanagement = 'groupmanagement';
const requests = 'requests';
const messaging = 'messaging';

const codelist = 'codelist';
const terminology = 'terminology';
const datamodel = 'datamodel';

const baseApiPath = `/${apiContext}/${api}/${version}`;
const commentRoundsApiPath = `${baseApiPath}/${commentRounds}`;
const sourcesApiPath = `${baseApiPath}/${sources}`;
const fakeableUsersPath = `/${apiContext}/${api}/${fakeableUsers}`;
const configurationPath = `/${apiContext}/${api}/${configuration}`;
const organizationsBasePath = `${baseApiPath}/${organizations}`;
const codelistBasePath = `${baseApiPath}/${codelist}`;
const terminologyBasePath = `${baseApiPath}/${terminology}`;
const datamodelBasePath = `${baseApiPath}/${datamodel}`;
const groupManagementRequestsBasePath = `${baseApiPath}/${groupmanagement}/${requests}`;

const ACTION_GET = 'GET';
const ACTION_ADD = 'ADD';
const ACTION_DELETE = 'DELETE';
const user = 'user';
const subscriptions = 'subscriptions';
const subscriptiontype = 'subscriptiontype';
const messagingApiContext = 'messaging-api';
const messagingBaseApiPath = `/${messagingApiContext}/${api}/${version}`;
// Constants for either application proxy messaging or direct access
const messagingProxyBasePath = `${baseApiPath}/${messaging}`;
const messagingApiBasePath = `${messagingBaseApiPath}`;

interface FakeableUser {
  email: string;
  firstName: string;
  lastName: string;
}

interface WithResults<T> {
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient,
              private authorizationManager: AuthorizationManager) {
  }

  static resolveIntegrationApiPathForContainerType(containerType: string): string {

    let containerPath;

    switch (containerType) {
      case codelist:
        containerPath = codelistBasePath;
        break;
      case terminology:
        containerPath = terminologyBasePath;
        break;
      case datamodel:
        containerPath = datamodelBasePath;
        break;
      default:
        // TODO: Produce error in case container type is not known!
        containerPath = codelistBasePath;
        break;
    }

    return containerPath;
  }

  getFakeableUsers(): Observable<FakeableUser[]> {

    return this.http.get<FakeableUser[]>(fakeableUsersPath);
  }

  getServiceConfiguration(): Observable<ServiceConfiguration> {

    return this.http.get<ServiceConfiguration>(`${configurationPath}`);
  }

  getCommentRounds(organizationId: string | null,
                   status: string | null,
                   containerType: string | null,
                   searchTerm: string | null,
                   filterIncomplete: boolean,
                   filterContent: boolean | null): Observable<CommentRound[]> {

    let params = new HttpParams()
      .set('expand', 'source,organization');

    if (containerType) {
      params = params.append('containerType', containerType);
    }

    if (searchTerm) {
      params = params.append('searchTerm', searchTerm);
    }

    if (organizationId) {
      params = params.append('organizationId', organizationId);
    }

    if (status) {
      params = params.append('status', status);
    }

    if (filterIncomplete) {
      params = params.append('filterIncomplete', String(filterIncomplete));
    }

    if (filterContent) {
      params = params.append('filterContent', String(filterContent));
    }

    return this.http.get(commentRoundsApiPath, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentRoundType) => new CommentRound(data));
      }));
  }

  getCommentRound(commentRoundId: string): Observable<CommentRound> {

    const params = new HttpParams()
      .set('expand', 'source,organization,commentThread');

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return new CommentRound(res as CommentRoundType);
      }));
  }

  getCommentRoundCommenterComments(commentRoundId: string): Observable<Comment[]> {

    const params = new HttpParams()
      .set('expand', 'source,organization,comment,commentThread');

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId + '/' + 'mycomments', { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentType) => new Comment(data));
      }));
  }

  getCommentRoundCommentThread(commentRoundId: string, commentThreadId: string): Observable<CommentThread> {

    const params = new HttpParams()
      .set('expand', 'comment,commentRound,organization,source');

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId + '/' + commentThreads + '/' + commentThreadId,
      { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return new CommentThread(res as CommentThreadType);
      }));
  }

  getCommentRoundCommentThreads(commentRoundId: string): Observable<CommentThreadSimple[]> {

    const params = new HttpParams()
      .set('expand', 'comment');

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId + '/' + commentThreads, { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentThreadSimpleType) => new CommentThreadSimple(data));
      }));
  }

  getCommentRoundCommentThreadComments(commentRoundId: string, commentThreadId: string): Observable<CommentSimple[]> {

    return this.http.get(commentRoundsApiPath + '/' + commentRoundId + '/' + commentThreads + '/' + commentThreadId + '/' + comments,
      { responseType: 'json' })
      .pipe(map((res: any) => {
        return res.results.map(
          (data: CommentSimpleType) => new CommentSimple(data));
      }));
  }

  getCommentRoundCommentThreadComment(commentRoundId: string, commentThreadId: string, commentId: string): Observable<Comment> {

    const params = new HttpParams()
      .set('expand', 'commentThread,commentRound');

    return this.http.get(
      commentRoundsApiPath + '/' + commentRoundId + '/' + commentThreads + '/' + commentThreadId + '/' + comments + '/' + commentId,
      { params: params, responseType: 'json' })
      .pipe(map((res: any) => {
        return new Comment(res as CommentType);
      }));
  }

  createSource(sourceToCreate: SourceType): Observable<Source> {

    return this.createSources([sourceToCreate]).pipe(map(createdSources => {
      if (createdSources.length !== 1) {
        throw new Error('Exactly one comment source needs to be created');
      } else {
        return createdSources[0];
      }
    }));
  }

  createSources(sourcesList: SourceType[]): Observable<Source[]> {

    return this.http.post<WithResults<SourceType>>(`${sourcesApiPath}/`,
      sourcesList)
      .pipe(map(res => res.results.map(data => new Source(data))));
  }

  createCommentRound(commentRoundToCreate: CommentRoundType): Observable<CommentRound> {

    return this.createCommentRounds([commentRoundToCreate]).pipe(map(createdCommentRounds => {
      if (createdCommentRounds.length !== 1) {
        throw new Error('Exactly one comment round needs to be created');
      } else {
        return createdCommentRounds[0];
      }
    }));
  }

  deleteCommentRound(commentRound: CommentRound): Observable<ApiResponseType> {

    const commentRoundId: string = commentRound.id;

    return this.http.delete<ApiResponseType>(`${commentRoundsApiPath}/${commentRoundId}`);
  }

  createCommentRounds(commentRoundList: CommentRoundType[]): Observable<CommentRound[]> {

    const params = new HttpParams()
      .set('expand', 'source,organization,commentThread');

    return this.http.post<WithResults<CommentRoundType>>(`${commentRoundsApiPath}/`,
      commentRoundList, { params: params })
      .pipe(map(res => res.results.map(data => new CommentRound(data))));
  }

  updateCommentRound(commentRoundToUpdate: CommentRoundType): Observable<CommentRoundType> {

    const params = new HttpParams()
      .set('expand', 'source,organization,commentThread');

    const commentRoundId: string = commentRoundToUpdate.id;

    return this.http.post<CommentRoundType>(`${commentRoundsApiPath}/${commentRoundId}/`, commentRoundToUpdate, { params: params });
  }

  createCommentThread(commentThreadToCreate: CommentThreadType): Observable<CommentThread> {

    const commentRoundId: string = commentThreadToCreate.commentRound.id;

    return this.createCommentThreads(commentRoundId, [commentThreadToCreate], true).pipe(map(createdCommentThreads => {
      if (createdCommentThreads.length !== 1) {
        throw new Error('Exactly one comment thread needs to be created');
      } else {
        return createdCommentThreads[0];
      }
    }));
  }

  createCommentThreads(commentRoundId: string, commentThreadList: CommentThreadSimpleType[],
                       removeOrphans: boolean): Observable<CommentThread[]> {

    const params = new HttpParams()
      .set('removeOrphans', removeOrphans ? 'true' : 'false')
      .set('expand', 'comment');

    return this.http.post<WithResults<CommentThreadType>>(`${commentRoundsApiPath}/${commentRoundId}/${commentThreads}/`,
      commentThreadList, { params: params })
      .pipe(map(res => res.results.map(data => new CommentThread(data))));
  }

  updateCommentThread(commentThreadToUpdate: CommentThreadType): Observable<CommentThreadSimpleType> {

    const commentRoundId: string = commentThreadToUpdate.commentRound.id;
    const commentThreadId: string = commentThreadToUpdate.id;

    const params = new HttpParams()
      .set('expand', 'comment');

    return this.http.post<CommentThreadSimpleType>(`${commentRoundsApiPath}/${commentRoundId}/${commentThreads}/${commentThreadId}/`,
      commentThreadToUpdate, { params: params });
  }

  createComment(commentRoundId: string, commentToCreate: CommentType): Observable<Comment> {

    const commentThreadId: string = commentToCreate.commentThread.id;

    return this.createCommentToCommentThread(commentRoundId, commentThreadId, [commentToCreate]).pipe(map(createdComments => {
      if (createdComments.length !== 1) {
        throw new Error('Exactly one comment needs to be created');
      } else {
        return createdComments[0];
      }
    }));
  }

  createCommentToCommentThread(commentRoundId: string, commentThreadId: string, commentsList: CommentType[]): Observable<Comment[]> {

    const params = new HttpParams()
      .set('expand', 'commentThread,commentRound');

    return this.http.post<WithResults<CommentType>>(
      `${commentRoundsApiPath}/${commentRoundId}/${commentThreads}/${commentThreadId}/${comments}`,
      commentsList, { params: params })
      .pipe(map(res => res.results.map(data => new Comment(data))));
  }

  createCommentsToCommentRound(commentRoundId: string, commentsList: CommentType[]): Observable<CommentSimple[]> {

    const params = new HttpParams()
      .set('expand', 'commentThread,commentRound');

    return this.http.post<WithResults<CommentSimpleType>>(
      `${commentRoundsApiPath}/${commentRoundId}/${comments}`, commentsList, { params: params })
      .pipe(map(res => res.results.map(data => new CommentSimple(data))));
  }

  updateComment(commentRoundId: string, commentToUpdate: CommentType): Observable<CommentSimpleType> {

    const commentThreadId: string = commentToUpdate.commentThread.id;
    const commentId: string = commentToUpdate.id;

    const params = new HttpParams()
      .set('expand', 'commentThread,commentRound');

    return this.http.post<CommentSimpleType>(
      `${commentRoundsApiPath}/${commentRoundId}/${commentThreads}/${commentThreadId}/${comments}/${commentId}/`,
      commentToUpdate, { params: params });
  }

  deleteComment(commentRoundId: string, commentToDelete: CommentType): Observable<CommentSimpleType> {

    const commentThreadId: string = commentToDelete.commentThread.id;
    const commentId: string = commentToDelete.id;
    return this.http.delete<CommentSimpleType>(
      `${commentRoundsApiPath}/${commentRoundId}/${commentThreads}/${commentThreadId}/${comments}/${commentId}/delete`);
  }

  getOrganizations(): Observable<Organization[]> {

    return this.http.get<WithResults<OrganizationType>>(organizationsBasePath)
      .pipe(map(res => res.results.map(data => new Organization(data))));
  }

  getOrganizationsWithCommentRounds(): Observable<Organization[]> {

    const params = new HttpParams()
      .set('expand', 'commentRound')
      .set('hasCommentRounds', 'true');

    return this.http.get<WithResults<OrganizationType>>(organizationsBasePath, { params: params })
      .pipe(map(res => res.results.map(data => new Organization(data))));
  }

  getUserRequests(): Observable<UserRequest[]> {

    return this.http.get<WithResults<UserRequest>>(`${groupManagementRequestsBasePath}/`)
      .pipe(map(response => response.results));
  }

  getContainers(containerType: string, language: string): Observable<IntegrationResource[]> {

    const integrationRequest = new IntegrationRequest();
    if (language) {
      integrationRequest.language = language;
    }
    if (this.authorizationManager.user.superuser) {
      integrationRequest.includeIncomplete = true;
    } else {
      const userOrganizations = Array.from(this.authorizationManager.user
        .getOrganizations(['ADMIN', 'CODE_LIST_EDITOR', 'TERMINOLOGY_EDITOR', 'DATA_MODEL_EDITOR', 'MEMBER']));

      if (userOrganizations && userOrganizations.length > 0) {
        integrationRequest.includeIncompleteFrom = userOrganizations;
      }
    }
    const containerPath = DataService.resolveIntegrationApiPathForContainerType(containerType) + '/' + containers;
    return this.http.post<WithResults<IntegrationResourceType>>(containerPath,
      integrationRequest,
      { responseType: 'json' })
      .pipe(map(res => res.results.map((data: IntegrationResourceType) => new IntegrationResource(data))));
  }

  getResourcesPaged(containerType: string, uri: string, language: string, pageSize: number, from: number,
                    status: string | null, searchTerm: string | null, restrictedResourceUris: string[]): Promise<IntegrationResource[]> {

    const integrationRequest = new IntegrationRequest();
    integrationRequest.container = uri;
    integrationRequest.pageSize = pageSize;
    integrationRequest.pageFrom = from;
    integrationRequest.language = language;
    integrationRequest.includeIncomplete = true;
    if (containerType === 'codelist') {
      integrationRequest.type = 'code';
    }
    if (searchTerm) {
      integrationRequest.searchTerm = searchTerm;
    }
    if (status) {
      integrationRequest.status = [];
      integrationRequest.status.push(status);
    }
    if (restrictedResourceUris && restrictedResourceUris.length > 0) {
      integrationRequest.filter = restrictedResourceUris;
    }
    const resourcePath = DataService.resolveIntegrationApiPathForContainerType(containerType) + '/' + resources;
    const fetchResult: Observable<IntegrationResource[]> = this.http.post<WithResults<IntegrationResourceType>>(resourcePath,
      integrationRequest,
      { responseType: 'json' })
      .pipe(map(res => res.results.map((data: IntegrationResourceType) => new IntegrationResource(data))));
    return fetchResult.toPromise();
  }

  subscriptionRequest(resourceUri: string, type: string | undefined, action: string): Observable<boolean> {

    const subscriptionRequest: SubscriptionRequest = new SubscriptionRequest();
    subscriptionRequest.uri = resourceUri;
    if (type) {
      subscriptionRequest.type = type;
    }
    subscriptionRequest.action = action;

    return this.http.post(`${messagingApiBasePath}/${subscriptions}/`, subscriptionRequest, { observe: 'response' })
      .pipe(
        map(res => res.status === 200),
        catchError(err => of(false))
      );
  }

  getSubscription(resourceUri: string): Observable<boolean> {

    return this.subscriptionRequest(resourceUri, undefined, ACTION_GET);
  }

  addSubscription(resourceUri: string, type: string): Observable<boolean> {

    return this.subscriptionRequest(resourceUri, type, ACTION_ADD);
  }

  deleteSubscription(resourceUri: string): Observable<boolean> {

    return this.subscriptionRequest(resourceUri, undefined, ACTION_DELETE);
  }

  getMessagingUserData(): Observable<MessagingUser | undefined> {

    return this.http.get<MessagingUserType>(`${messagingApiBasePath}/${user}`)
      .pipe(map(res => new MessagingUser(res)),
        catchError(err => of(undefined)));
  }

  setSubscriptionType(subscriptionType: string): Observable<MessagingUser> {

    const subscriptionTypeRequest: SubscriptionTypeRequest = new SubscriptionTypeRequest();
    subscriptionTypeRequest.subscriptionType = subscriptionType;

    return this.http.post<MessagingUserType>(`${messagingApiBasePath}/${user}/${subscriptiontype}`, subscriptionTypeRequest)
      .pipe(map(res => new MessagingUser(res)));
  }
}
