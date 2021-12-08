import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private router : Router
  ) {
  }

  title = 'devtools';

  @HostBinding('class.is-home')
  isHome = false;

  ngOnInit() {
    this.router.events.subscribe(ev => {
      this.isHome = this.router.url === '/';
    });
  }
}
