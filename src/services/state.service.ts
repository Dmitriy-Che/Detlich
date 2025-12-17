
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  currentScreen = signal('landing');
  user = signal(null);
  quizData = signal(null);
  analysisResult = signal(null);
  horoscopeResult = signal(null);
  userEmail = signal(null);
  birthDate = signal(null);

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

  loadStateFromLocalStorage() {
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

  login(userData) {
    this.user.set(userData);
    this.navigateTo('quiz-step-1');
  }

  submitQuizStep1(data) {
    this.quizData.set(data);
    this.navigateTo('loading-analysis');
  }

  submitBirthDate(date) {
    this.birthDate.set(date);
    this.navigateTo('loading-horoscope');
  }

  setAnalysisResult(result) {
    this.analysisResult.set(result);
    this.navigateTo('result-basic');
  }

  setHoroscopeResult(result) {
    this.horoscopeResult.set(result);
    this.navigateTo('result-horoscope');
  }

  navigateTo(screen) {
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
