
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-horoscope-upsell',
  imports: [CommonModule, FormsModule],
  templateUrl: './horoscope-upsell.component.html',
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
