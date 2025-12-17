
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { NgZone, ɵNoopNgZone } from '@angular/core';

import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Manually provide NoopNgZone to run the application without Zone.js
    { provide: NgZone, useClass: ɵNoopNgZone },
    provideHttpClient(),
  ],
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.