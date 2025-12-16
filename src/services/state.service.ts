import { Injectable, signal, WritableSignal, effect } from '@angular/core';

export type Screen = 'landing' | 'quiz-step-1' | 'loading-analysis' | 'result-basic' | 'horoscope-upsell' | 'loading-horoscope' | 'result-horoscope' | 'monetization';

export interface User {
  id: number;
  first_name: string;
  photo_url?: string;
}

export interface QuizData {
  photoBase64: string;
  photoMimeType: string;
  height: number;
  weight: number;
  age: number;
  gender: string;
}

// --- New & Updated Interfaces ---

export interface CrystalTeaser {
  name: string;
  shortDescription: string;
}

export interface CelebrityTeaser {
  name: string;
  shortDescription: string;
}

export interface InteriorTeaser {
  description: string;
  previewImages: string[];
}

export interface AnalysisResult {
  archetype: string;
  description: string;
  recommendations: string[];
  previewImages: string[];
  crystalTeaser: CrystalTeaser[];
  celebrityTeaser: CelebrityTeaser[];
  interiorTeaser: InteriorTeaser;
}

export interface HoroscopeResult {
    love: string;
    career: string;
    health: string;
}

export interface CrystalInfo {
  name: string;
  description: string;
  usage: string;
  photoUrl: string;
}

export interface CelebrityMatch {
  name: string;
  similarity: number;
  reason: string;
  photoUrl: string;
}

export interface InteriorDesign {
    recommendations: string[];
    exampleImages: string[];
}

export interface PaidContent {
  fullReport?: string;
  paidPortrait?: string;
  crystals?: CrystalInfo[];
  celebrities?: CelebrityMatch[];
  interiorDesign?: InteriorDesign;
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
  birthDate: WritableSignal<string | null> = signal(null);

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

  submitBirthDate(date: string) {
    this.birthDate.set(date);
    this.navigateTo('loading-horoscope');
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

  goBack() {
    switch (this.currentScreen()) {
      case 'monetization':
        this.navigateTo('result-horoscope');
        break;
      case 'result-horoscope':
        this.navigateTo('horoscope-upsell');
        break;
      case 'horoscope-upsell':
        this.navigateTo('result-basic');
        break;
      case 'result-basic':
        this.navigateTo('quiz-step-1');
        break;
    }
  }

  resetToHome() {
    this.user.set(null);
    this.quizData.set(null);
    this.analysisResult.set(null);
    this.horoscopeResult.set(null);
    this.birthDate.set(null);
    this.navigateTo('landing');
  }
}