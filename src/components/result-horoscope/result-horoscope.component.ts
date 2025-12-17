
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service.js';
import { ShareComponent } from '../share/share.component.js';

@Component({
  selector: 'app-result-horoscope',
  standalone: true,
  imports: [CommonModule, ShareComponent],
  template: `
<div class="w-full max-w-md mx-auto p-6 bg-white/80 rounded-3xl shadow-lg backdrop-blur-sm animate-glow">
  @if (horoscope(); as h) {
    <div class="text-center mb-6">
      <h1 class="font-serif text-3xl font-bold text-dark-purple">Твой прогноз на 30 дней</h1>
    </div>
    
    <div class="space-y-6">
      <div class="p-4 bg-powder-pink/50 rounded-xl">
        <h3 class="font-serif text-2xl font-semibold mb-2 text-dark-purple/90">💖 Любовь и Отношения</h3>
        <p class="font-sans text-dark-purple/80">{{ h.love }}</p>
      </div>
      <div class="p-4 bg-mint/50 rounded-xl">
        <h3 class="font-serif text-2xl font-semibold mb-2 text-dark-purple/90">🚀 Карьера и Реализация</h3>
        <p class="font-sans text-dark-purple/80">{{ h.career }}</p>
      </div>
      <div class="p-4 bg-lavender/50 rounded-xl">
        <h3 class="font-serif text-2xl font-semibold mb-2 text-dark-purple/90">🌿 Здоровье и Энергия</h3>
        <p class="font-sans text-dark-purple/80">{{ h.health }}</p>
      </div>
    </div>
    
    <button (click)="goToNextStep()" class="mt-8 w-full bg-gold-accent text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity transform hover:scale-105 shadow-lg">
      Раскрыть весь потенциал
    </button>

    <app-share [shareText]="shareText" [shareTitle]="shareTitle"></app-share>

  } @else {
     <p class="text-center font-sans">Загружаем твой гороскоп...</p>
  }
</div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultHoroscopeComponent {
  stateService = inject(StateService);
  horoscope = this.stateService.horoscopeResult;
  
  shareText = "Получила свой персональный гороскоп от звёзд! 🔮 Хочешь узнать, что ждёт тебя? Попробуй Детейлинг личности.";
  shareTitle = "Мой персональный гороскоп | Детейлинг личности";

  goToNextStep() {
    this.stateService.navigateTo('monetization');
  }
}
