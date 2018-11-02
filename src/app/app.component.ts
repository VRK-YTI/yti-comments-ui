import { Component } from '@angular/core';
import { LocationService } from './services/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private locationService: LocationService,
              private router: Router) {
  }

  get location() {

    return this.locationService.location;
  }

  navigateToInformation() {

    this.router.navigate(['/information']);
  }
}
