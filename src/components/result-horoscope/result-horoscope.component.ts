
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ShareComponent } from '../share/share.component';

@Component({
  selector: 'app-result-horoscope',
  imports: [CommonModule, ShareComponent],
  templateUrl: './result-horoscope.component.html',
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
