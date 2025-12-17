
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { NgZone, ɵNoopNgZone } from '@angular/core';

import { AppComponent } from './src/app.component.js';

bootstrapApplication(AppComponent, {
  providers: [
    // Manually provide NoopNgZone to run the application without Zone.js
    { provide: NgZone, useClass: ɵNoopNgZone },
    provideHttpClient(),
  ],
}).catch(err => console.error(err));

// This file was renamed from index.tsx to index.js for compatibility
// with static hosting services like GitHub Pages, which require a .js
// extension to serve the file as an executable JavaScript module.