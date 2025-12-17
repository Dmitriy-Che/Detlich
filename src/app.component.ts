
import { Component, ChangeDetectionStrategy, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StateService } from './services/state.service.js';
import { LandingComponent } from './components/landing/landing.component.js';
import { QuizStep1Component } from './components/quiz-step-1/quiz-step-1.component.js';
import { LoadingAnalysisComponent } from './components/loading-analysis/loading-analysis.component.js';
import { ResultBasicComponent } from './components/result-basic/result-basic.component.js';
import { HoroscopeUpsellComponent } from './components/horoscope-upsell/horoscope-upsell.component.js';
import { MonetizationComponent } from './components/monetization/monetization.component.js';
import { LoadingHoroscopeComponent } from './components/loading-horoscope/loading-horoscope.component.js';
import { ResultHoroscopeComponent } from './components/result-horoscope/result-horoscope.component.js';
import { ShareComponent } from './components/share/share.component.js';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
<main class="min-h-screen w-full flex flex-col items-center p-4 bg-beige text-dark-purple overflow-hidden relative">
  <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-powder-pink/30 via-lavender/30 to-mint/30 opacity-50 -z-10"></div>
  
  <!-- This container will grow to push the footer down, and center the content vertically -->
  <div class="w-full max-w-md mx-auto flex-grow flex flex-col justify-center">
    @switch (currentScreen()) {
      @case ('landing') {
        <app-landing></app-landing>
      }
      @case ('quiz-step-1') {
        <app-quiz-step-1></app-quiz-step-1>
      }
      @case ('loading-analysis') {
        <app-loading-analysis></app-loading-analysis>
      }
      @case ('result-basic') {
        <app-result-basic></app-result-basic>
      }
      @case ('horoscope-upsell') {
        <app-horoscope-upsell></app-horoscope-upsell>
      }
      @case ('loading-horoscope') {
        <app-loading-horoscope></app-loading-horoscope>
      }
       @case ('result-horoscope') {
        <app-result-horoscope></app-result-horoscope>
      }
      @case ('monetization') {
        <app-monetization></app-monetization>
      }
    }
  </div>

  <!-- This container holds the optional button and the footer, always at the bottom -->
  <div class="w-full max-w-md mx-auto text-center pt-4 flex-shrink-0">
    <div class="flex justify-center items-center space-x-4 mb-4">
       @if (currentScreen() !== 'landing' && currentScreen() !== 'quiz-step-1') {
         <button (click)="goBack()" class="p-3 bg-white/70 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-dark-purple/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      }
      @if (currentScreen() !== 'landing') {
        <button (click)="goToHome()" class="p-3 bg-white/70 rounded-full shadow-md hover:bg-white transition-colors backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-dark-purple/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      }
      <a href="https://t.me/fehu369" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-6 py-3 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-transform transform hover:scale-105">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="white" viewBox="0 0 24 24"><path d="M22,2L2,9l7,2,2,7,9-18Z"/></svg>
        <span class="font-sans font-semibold">Перейти в наш канал</span>
      </a>
    </div>
    <footer class="text-xs text-dark-purple/60">
      Детейлинг личности © 2025 • Telegram-канал &#64;fehu369
    </footer>
  </div>
</main>
`,
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
  stateService = inject(StateService);
  currentScreen = this.stateService.currentScreen;

  constructor() {
    effect(() => {
      console.log(`Screen changed to: ${this.currentScreen()}`);
    });
  }

  goToHome() {
    this.stateService.resetToHome();
  }

  goBack() {
    this.stateService.goBack();
  }
}
