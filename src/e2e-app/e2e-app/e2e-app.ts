import {Component, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'home',
  template: `<p>e2e tests!</p>`
})
export class Home {}

@Component({
  moduleId: module.id,
  selector: 'e2e-app',
  templateUrl: 'e2e-app.html',
  encapsulation: ViewEncapsulation.None,
})
export class E2EApp {
  navItems = [
    {name: 'Start', route: '/'},
    {name: 'Button', route: '/button'},
    {name: 'Input', route: '/input'},
    {name: 'Radio', route: '/radio'},
    {name: 'Tile', route: '/tile'},
    {name: 'Context Menu', route: '/context-menu'}
  ];
}
