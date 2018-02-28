import {Component, ElementRef, ViewEncapsulation} from '@angular/core';

/**
 * The entry app for demo site. Routes under `accessibility` will use AccessibilityDemo component,
 * while other demos will use `DemoApp` component. Since DemoApp and AccessibilityDemo use
 * different templates (DemoApp has toolbar and sidenav), we use this EntryApp in index.html
 * as our entry point.
 */
@Component({
  moduleId: module.id,
  selector: 'entry-app',
  template: '<router-outlet></router-outlet>',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class EntryApp {}

/**
 * Home component for welcome message in DemoApp.
 */
@Component({
  selector: 'home',
  template: `
    <p>Welcome to the development demos for the Dynatrace Angular Groundhog</p>
  `
})
export class Home {}

/**
 * DemoApp with toolbar and sidenav.
 */
@Component({
  moduleId: module.id,
  selector: 'demo-app',
  templateUrl: 'demo-app.html',
  styleUrls: ['demo-app.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class DemoApp {
  navItems = [
    {name: 'Start', route: '/'},
    {name: 'Button', route: '/button'},
    {name: 'Icon', route: '/icon'},
    {name: 'Input', route: '/input'},
    {name: 'Island', route: '/island'},
    {name: 'Progress circle', route: '/progress-circle'},
    {name: 'Radio', route: '/radio'},
    {name: 'Select', route: '/select'},
    {name: 'Tile', route: '/tile'},
    {name: 'ContextMenu', route: '/context-menu'},
  ];
}
