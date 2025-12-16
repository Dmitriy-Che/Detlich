
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-result-basic',
  imports: [CommonModule],
  templateUrl: './result-basic.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultBasicComponent {
  stateService = inject(StateService);
  result = this.stateService.analysisResult;
  user = this.stateService.user;

  goToNextStep() {
    this.stateService.navigateTo('horoscope-upsell');
  }
}
