
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-loading-horoscope',
  imports: [CommonModule],
  templateUrl: './loading-horoscope.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingHoroscopeComponent implements OnInit, OnDestroy {
  geminiService = inject(GeminiService);
  stateService = inject(StateService);
  progress = signal(0);
  progressText = signal("Составляю натальную карту...");
  flooredProgress = computed(() => Math.floor(this.progress()));
  private intervalId: any;

  ngOnInit(): void {
    this.startProgressSimulation();
    this.runHoroscopeGeneration();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startProgressSimulation() {
    const totalDuration = 4000; // Time to reach 90%
    const intervalTime = 40;
    const targetProgress = 90;
    const increment = targetProgress / (totalDuration / intervalTime);
    
    const messages: { [key: number]: string } = {
        0: "Составляю натальную карту...",
        25: "Ищу твой асцендент...",
        50: "Толкую положение планет...",
        75: "Заглядываю в будущее...",
    };

    this.intervalId = setInterval(() => {
        this.progress.update(p => {
            const newProgress = Math.min(p + increment, targetProgress);
            const currentMessageKey = Object.keys(messages).reverse().find(key => newProgress >= parseInt(key));
            if (currentMessageKey) {
                this.progressText.set(messages[parseInt(currentMessageKey)]);
            }
            return newProgress;
        });
        if (this.progress() >= targetProgress) {
            clearInterval(this.intervalId);
        }
    }, intervalTime);
  }

  async runHoroscopeGeneration() {
    const birthDate = this.stateService.birthDate();
    if (!birthDate) {
      console.error('Birth date is missing!');
      this.stateService.navigateTo('horoscope-upsell');
      return;
    }

    try {
        const result = await this.geminiService.getHoroscope(birthDate);
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        this.progress.set(99);
        this.progressText.set("Послание почти готово! ✅");
        
        await new Promise(resolve => setTimeout(resolve, 400));

        this.progress.set(100);
        this.progressText.set("Готово!");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.stateService.setHoroscopeResult(result);

    } catch (error) {
        console.error("Horoscope generation failed", error);
        // Fallback to monetization page if horoscope fails
        this.stateService.navigateTo('monetization');
    }
  }
}