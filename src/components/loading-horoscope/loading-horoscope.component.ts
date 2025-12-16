
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-horoscope',
  imports: [CommonModule],
  templateUrl: './loading-horoscope.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingHoroscopeComponent {}
