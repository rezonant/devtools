import { Component, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
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
    console.info(
      `%c                                                                 `, 
      `
        font-size: 300%; 
        padding: 1em 0 0 0; 
        background-image: rgb(39, 39, 39); 
        background-repeat: no-repeat;
        background-position: left;
        background-size: contain;
        color: #fff; 
        background-image: url(${window.origin}/assets/logo.svg);`
    );
    
    this.router.events.subscribe(ev => {
      this.isHome = this.router.url.replace(/#.*/, '') === '/';
    });
  }
}
