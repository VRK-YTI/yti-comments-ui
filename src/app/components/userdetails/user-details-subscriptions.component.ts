import { Component, Input, OnInit } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ignoreModalClose } from 'yti-common-ui/utils/modal';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ConfigurationService } from '../../services/configuration.service';
import { BehaviorSubject } from 'rxjs';
import { CommentsErrorModalService } from '../common/error-modal.service';
import { MessagingResource } from '../../entities-messaging/messaging-resource';
import { MessagingService } from '../../services/messaging-service';
import { UserService } from 'yti-common-ui/services/user.service';

@Component({
  selector: 'app-user-details-subscriptions',
  styleUrls: ['./user-details-subscriptions.component.scss'],
  templateUrl: './user-details-subscriptions.component.html',
})
export class UserDetailsSubscriptionsComponent implements OnInit {

  @Input() tabSet: NgbTabset;

  messagingResources$ = new BehaviorSubject<Map<string, MessagingResource[]> | null>(null);
  subscriptionType: string;
  loading = true;

  APPLICATION_CODELIST = 'codelist';
  APPLICATION_TERMINOLOGY = 'terminology';
  APPLICATION_DATAMODEL = 'datamodel';
  APPLICATION_COMMENTS = 'comments';

  constructor(public languageService: LanguageService,
              private messagingService: MessagingService,
              private configurationService: ConfigurationService,
              private userService: UserService,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentsErrorModalService) {
  }

  ngOnInit() {

    if (this.canSubscribe) {
      this.getUserSubscriptionData();
    } else {
      this.loading = false;
    }
  }

  getUserSubscriptionData() {

    this.loading = true;

    this.messagingService.getMessagingUserData().subscribe(messagingUserData => {
      if (messagingUserData) {
        this.subscriptionType = messagingUserData.subscriptionType;
        const resources = new Map<string, MessagingResource[]>();
        const codelistMessagingResources: MessagingResource[] = [];
        const datamodelMessagingResources: MessagingResource[] = [];
        const terminologyMessagingResources: MessagingResource[] = [];
        const commentsMessagingResources: MessagingResource[] = [];

        messagingUserData.resources.forEach(resource => {
          if (resource.application === this.APPLICATION_CODELIST) {
            codelistMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_DATAMODEL) {
            datamodelMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_TERMINOLOGY) {
            terminologyMessagingResources.push(resource);
          } else if (resource.application === this.APPLICATION_COMMENTS) {
            commentsMessagingResources.push(resource);
          }
        });
        if (codelistMessagingResources.length > 0) {
          resources.set(this.APPLICATION_CODELIST, codelistMessagingResources);
        }
        if (datamodelMessagingResources.length > 0) {
          resources.set(this.APPLICATION_DATAMODEL, datamodelMessagingResources);
        }
        if (terminologyMessagingResources.length > 0) {
          resources.set(this.APPLICATION_TERMINOLOGY, terminologyMessagingResources);
        }
        if (commentsMessagingResources.length > 0) {
          resources.set(this.APPLICATION_COMMENTS, commentsMessagingResources);
        }
        if (resources.size > 0) {
          this.messagingResources = resources;
        } else {
          this.messagingResources = null;
        }
      } else {
        this.messagingResources = null;
      }
      this.loading = false;
    });
  }

  get canSubscribe(): boolean {
    return this.configurationService.isMessagingEnabled && this.userService.isLoggedIn();
  }

  get messagingResources(): Map<string, MessagingResource[]> | null {

    return this.messagingResources$.getValue();
  }

  set messagingResources(value: Map<string, MessagingResource[]> | null) {

    this.messagingResources$.next(value);
  }

  removeSubscription(resource: MessagingResource) {

    this.confirmationModalService.openRemoveSubscription()
      .then(() => {
        this.messagingService.deleteSubscription(resource.uri).subscribe(success => {
          if (success) {
            const messagingResources = this.messagingResources;
            if (messagingResources != null) {
              const resources = messagingResources.get(resource.application);
              if (resources != null) {
                const resourceIndex = resources.indexOf(resource, 0);
                if (resourceIndex > -1) {
                  resources.splice(resourceIndex, 1);
                }
                if (resources.length === 0) {
                  messagingResources.delete(resource.application);
                  this.messagingResources = messagingResources;
                }
                if (messagingResources.size === 0) {
                  this.tabSet.select('user_details_info_tab');
                }
              }
            }
          } else {
            this.errorModalService.open('Submit error', 'Subscription deletion failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  get isSubscriptionEnabled(): boolean {

    return this.subscriptionType !== 'DISABLED';
  }

  toggleSubscription(event: Event) {

    event.preventDefault();
    const subscriptionTargetType = this.subscriptionType === 'DAILY' ? 'DISABLED' : 'DAILY';

    this.confirmationModalService.openToggleNotifications(subscriptionTargetType === 'DAILY')
      .then(() => {
        this.messagingService.setSubscriptionType(subscriptionTargetType).subscribe(messagingUserData => {
          this.subscriptionType = messagingUserData.subscriptionType;
        });
      }, ignoreModalClose);
  }

  getUriWithEnv(uri: string): string | null {

    return this.configurationService.getUriWithEnv(uri);
  }
}
