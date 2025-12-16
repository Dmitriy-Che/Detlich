
import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { ShareComponent } from '../share/share.component';

@Component({
  selector: 'app-result-basic',
  imports: [CommonModule, ShareComponent],
  templateUrl: './result-basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultBasicComponent {
  stateService = inject(StateService);
  result = this.stateService.analysisResult;
  user = this.stateService.user;

  shareText = computed(() => {
      const archetype = this.result()?.archetype || 'Загадочная Душа';
      return `Я прошла Детейлинг личности и мой типаж — ${archetype}! ✨ Узнай и ты свою внутреннюю магию в этом приложении.`;
  });

  shareTitle = computed(() => {
    const archetype = this.result()?.archetype || 'Загадочная Душа';
    return `Мой типаж — ${archetype} | Детейлинг личности`;
  });

  goToNextStep() {
    this.stateService.navigateTo('horoscope-upsell');
  }
}
