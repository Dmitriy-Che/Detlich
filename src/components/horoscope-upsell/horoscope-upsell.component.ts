
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-horoscope-upsell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="w-full max-w-md mx-auto p-8 bg-white/80 rounded-3xl shadow-lg backdrop-blur-sm text-center">
  <h2 class="font-serif text-3xl font-bold mb-4">Хочешь узнать, что ждёт тебя в ближайшие 30 дней?</h2>
  <p class="font-sans text-lg mb-6 text-dark-purple/80">Звёзды уже знают 😉</p>
  
  <div class="mb-6">
    <label for="birthDate" class="font-sans text-sm font-medium">Введи свою дату рождения:</label>
    <input 
      type="date" 
      id="birthDate" 
      name="birthDate" 
      [(ngModel)]="birthDate"
      required 
      class="mt-2 block w-full bg-beige/50 border border-lavender rounded-lg p-3 text-center focus:ring-gold-accent focus:border-gold-accent transition"
      max="2010-01-01"
    >
  </div>
  
  @if (errorMessage()) {
    <p class="text-sm text-red-600 mb-4">{{ errorMessage() }}</p>
  }
  
  <button (click)="getHoroscope()" class="w-full bg-gold-accent text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity transform hover:scale-105 shadow-lg">
    Получить предсказание
  </button>
</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoroscopeUpsellComponent {
  stateService = inject(StateService);

  birthDate: string = '';
  errorMessage = signal<string | null>(null);

  getHoroscope() {
    if (!this.birthDate) {
      this.errorMessage.set('Пожалуйста, введи свою дату рождения.');
      return;
    }
    this.errorMessage.set(null);
    this.stateService.submitBirthDate(this.birthDate);
  }
}
