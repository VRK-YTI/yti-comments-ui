import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  template: `
    <div class="row content-box">
      <span>Cookies cleaned!</span>
    </div>
  `
})
export class CookieCleanupComponent implements OnInit {

  constructor(private cookieService: CookieService) {
  }

  ngOnInit() {
    this.cookieService.deleteAll();
  }
}
