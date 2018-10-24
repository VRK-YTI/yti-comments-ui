import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { Router } from '@angular/router';
import { ConfigurationService } from './services/configuration.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private locationService: LocationService,
              private router: Router,
              private configurationService: ConfigurationService) {
  }

  get location() {

    return this.locationService.location;
  }

  navigateToInformation() {

    this.router.navigate(['/information']);
  }

  get loading() {

    return this.configurationService.loading;
  }
}
