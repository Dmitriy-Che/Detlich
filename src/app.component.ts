
import { Component, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateService, Screen } from './services/state.service';
import { LandingComponent } from './components/landing/landing.component';
import { QuizStep1Component } from './components/quiz-step-1/quiz-step-1.component';
import { LoadingAnalysisComponent } from './components/loading-analysis/loading-analysis.component';
import { ResultBasicComponent } from './components/result-basic/result-basic.component';
import { HoroscopeUpsellComponent } from './components/horoscope-upsell/horoscope-upsell.component';
import { MonetizationComponent } from './components/monetization/monetization.component';
import { LoadingHoroscopeComponent } from './components/loading-horoscope/loading-horoscope.component';
import { ResultHoroscopeComponent } from './components/result-horoscope/result-horoscope.component';
import { ShareComponent } from './components/share/share.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LandingComponent,
    QuizStep1Component,
    LoadingAnalysisComponent,
    ResultBasicComponent,
    HoroscopeUpsellComponent,
    LoadingHoroscopeComponent,
    ResultHoroscopeComponent,
    MonetizationComponent,
    ShareComponent,
  ],
})
export class AppComponent {
  private stateService = inject(StateService);
  currentScreen = this.stateService.currentScreen;

  constructor() {
    effect(() => {
      console.log(`Screen changed to: ${this.currentScreen()}`);
    });
  }

  goToHome(): void {
    this.stateService.resetToHome();
  }
}
