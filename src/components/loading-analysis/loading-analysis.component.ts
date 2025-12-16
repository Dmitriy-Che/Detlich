
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-loading-analysis',
  imports: [CommonModule],
  templateUrl: './loading-analysis.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingAnalysisComponent implements OnInit, OnDestroy {
  geminiService = inject(GeminiService);
  stateService = inject(StateService);
  progress = signal(0);
  progressText = signal("Соединяюсь с космосом...");
  flooredProgress = computed(() => Math.floor(this.progress()));
  private intervalId: any;

  ngOnInit(): void {
    this.startProgressSimulation();
    this.runAnalysis();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startProgressSimulation() {
    const totalDuration = 6000; // Time to reach 90%
    const intervalTime = 60;
    const targetProgress = 90;
    const increment = targetProgress / (totalDuration / intervalTime);
    
    const messages: { [key: number]: string } = {
        0: "Соединяюсь с космосом...",
        20: "Анализирую твою фотографию...",
        40: "Сверяюсь со звёздной картой...",
        60: "Подбираю палитру стиля...",
        80: "Формирую персональные советы...",
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

  async runAnalysis() {
    const quizData = this.stateService.quizData();
    if (!quizData) {
      console.error('Quiz data is missing!');
      this.stateService.navigateTo('quiz-step-1');
      return;
    }

    try {
        const result = await this.geminiService.getPersonalityAnalysis(quizData);
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.progress.set(99);
        this.progressText.set("Почти готово! ✅");

        await new Promise(resolve => setTimeout(resolve, 400));

        this.progress.set(100);
        this.progressText.set("Готово!");
        
        await new Promise(resolve => setTimeout(resolve, 500));

        this.stateService.setAnalysisResult(result);

    } catch (error) {
        console.error("Analysis failed", error);
        this.stateService.navigateTo('quiz-step-1');
    }
  }
}