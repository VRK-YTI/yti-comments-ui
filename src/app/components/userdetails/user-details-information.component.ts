import { Component, OnDestroy } from '@angular/core';
import { Role, UserService } from 'yti-common-ui/services/user.service';
import { Router } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { index } from 'yti-common-ui/utils/array';
import { comparingLocalizable } from 'yti-common-ui/utils/comparator';
import { LanguageService } from '../../services/language.service';
import { LocationService } from '../../services/location.service';
import { DataService } from '../../services/data.service';
import { Organization } from '../../entity/organization';

interface UserOrganizationRoles {
  organization?: Organization;
  roles: Role[];
  requests: Role[];
}

@Component({
  selector: 'app-user-details-information',
  templateUrl: './user-details-information.component.html',
})
export class UserDetailsInformationComponent implements OnDestroy {

  private subscriptionToClean: Subscription[] = [];

  allOrganizations: Organization[];
  allOrganizationsById: Map<string, Organization>;
  selectedOrganization: Organization | null = null;
  requestsInOrganizations = new Map<string, Set<Role>>();

  constructor(private router: Router,
              private userService: UserService,
              private locationService: LocationService,
              private dataService: DataService,
              private languageService: LanguageService) {

    this.subscriptionToClean.push(this.userService.loggedIn$.subscribe(loggedIn => {
      if (!loggedIn) {
        router.navigate(['/']);
      }
    }));

    userService.updateLoggedInUser();

    locationService.atUserDetails();

    this.subscriptionToClean.push(
      combineLatest(this.dataService.getOrganizations(), languageService.language$)
        .subscribe(([organizations]) => {
          organizations.sort(comparingLocalizable<Organization>(languageService, org => org.prefLabel));
          this.allOrganizations = organizations;
          this.allOrganizationsById = index(organizations, org => org.id);
        })
    );

    this.refreshRequests();
  }

  ngOnDestroy() {

    this.subscriptionToClean.forEach(s => s.unsubscribe());
  }

  get user() {

    return this.userService.user;
  }

  get loading() {

    return !this.allOrganizations || !this.requestsInOrganizations;
  }

  get userOrganizations(): UserOrganizationRoles[] {

    const organizationIds = new Set<string>([
      ...Array.from(this.user.rolesInOrganizations.keys()),
      ...Array.from(this.requestsInOrganizations.keys())
    ]);

    const result = Array.from(organizationIds.values()).map(organizationId => {
      return {
        organization: this.allOrganizationsById.get(organizationId),
        roles: Array.from(this.user.getRoles(organizationId)),
        requests: Array.from(this.requestsInOrganizations.get(organizationId) || [])
      };
    });

    result.sort(comparingLocalizable<UserOrganizationRoles>(this.languageService, org =>
      org.organization ? org.organization.prefLabel : {}));

    return result;
  }

  refreshRequests() {

    this.selectedOrganization = null;

    this.dataService.getUserRequests().subscribe(userRequests => {

      this.requestsInOrganizations.clear();

      for (const userRequest of userRequests) {
        this.requestsInOrganizations.set(userRequest.organizationId, new Set<Role>(userRequest.role));
      }
    });
  }
}
