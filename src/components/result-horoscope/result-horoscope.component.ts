
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-result-horoscope',
  imports: [CommonModule],
  templateUrl: './result-horoscope.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultHoroscopeComponent {
  stateService = inject(StateService);
  horoscope = this.stateService.horoscopeResult;
  
  goToNextStep() {
    this.stateService.navigateTo('monetization');
  }
}
