
import { Injectable, signal, WritableSignal, effect } from '@angular/core';

export type Screen = 'landing' | 'quiz-step-1' | 'loading-analysis' | 'result-basic' | 'horoscope-upsell' | 'loading-horoscope' | 'result-horoscope' | 'monetization';

export interface User {
  id: number;
  first_name: string;
  photo_url?: string;
}

export interface QuizData {
  photoBase64: string;
  height: number;
  weight: number;
  age: number;
  gender: string;
}

export interface AnalysisResult {
  archetype: string;
  description: string;
  recommendations: string[];
  previewImages: string[];
}

export interface HoroscopeResult {
    love: string;
    career: string;
    health: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  currentScreen: WritableSignal<Screen> = signal('landing');
  user: WritableSignal<User | null> = signal(null);
  quizData: WritableSignal<QuizData | null> = signal(null);
  analysisResult: WritableSignal<AnalysisResult | null> = signal(null);
  horoscopeResult: WritableSignal<HoroscopeResult | null> = signal(null);
  userEmail: WritableSignal<string | null> = signal(null);

  constructor() {
    this.loadStateFromLocalStorage();

    effect(() => {
      const currentUser = this.user();
      if (currentUser) {
        localStorage.setItem('personality-user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('personality-user');
      }
    });
    
    effect(() => {
      const currentEmail = this.userEmail();
      if (currentEmail) {
        localStorage.setItem('personality-email', currentEmail);
      }
    });
  }

  private loadStateFromLocalStorage() {
    const savedUser = localStorage.getItem('personality-user');
    if (savedUser) {
      this.user.set(JSON.parse(savedUser));
      // If user exists, maybe they were in the middle of the quiz.
      // For this MVP, we'll start them at the step after login.
      this.currentScreen.set('quiz-step-1'); 
    }
     const savedEmail = localStorage.getItem('personality-email');
    if(savedEmail) {
        this.userEmail.set(savedEmail);
    }
  }

  login(userData: User) {
    this.user.set(userData);
    this.navigateTo('quiz-step-1');
  }

  submitQuizStep1(data: QuizData) {
    this.quizData.set(data);
    this.navigateTo('loading-analysis');
  }

  setAnalysisResult(result: AnalysisResult) {
    this.analysisResult.set(result);
    this.navigateTo('result-basic');
  }

  setHoroscopeResult(result: HoroscopeResult) {
    this.horoscopeResult.set(result);
    this.navigateTo('result-horoscope');
  }

  navigateTo(screen: Screen) {
    this.currentScreen.set(screen);
  }

  resetToHome() {
    this.user.set(null);
    this.quizData.set(null);
    this.analysisResult.set(null);
    this.horoscopeResult.set(null);
    this.navigateTo('landing');
  }
}
