
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, QuizData } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';

declare var YooCheckoutWidget: any;

@Component({
  selector: 'app-monetization',
  imports: [CommonModule, FormsModule],
  templateUrl: './monetization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonetizationComponent implements OnInit {
  stateService = inject(StateService);
  geminiService = inject(GeminiService);

  showEmailModal = signal(false);
  paymentType = signal<'subscription' | 'portrait' | null>(null);

  email = signal(this.stateService.userEmail() || '');
  consent = signal(false);
  emailError = signal<string | null>(null);
  
  paymentStatus = signal<'success' | 'cancelled' | null>(null);
  paidContent = signal<{ fullReport?: string; paidPortrait?: string }>({});

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      this.paymentStatus.set('success');
      this.loadPaidContent();
    } else if (urlParams.get('payment') === 'cancelled') {
        this.paymentStatus.set('cancelled');
    }
  }
  
  async loadPaidContent() {
    // In a real app, this would fetch content unlocked by payment.
    // Here we generate it on the fly for demonstration.
    const analysis = this.stateService.analysisResult();
    const quizData = this.stateService.quizData();
    if(analysis && quizData) {
        const portrait = await this.geminiService.generateOutfitImage(analysis.archetype, quizData.gender, 'high');
        this.paidContent.set({
            fullReport: "Это ваш полный отчет. Здесь будет детальный разбор вашего архетипа, расширенные рекомендации по стилю, нумерологический анализ и многое другое, что поможет вам на пути самопознания. Каждая деталь важна, и мы раскрываем их все для вас.",
            paidPortrait: portrait
        });
    }
  }

  openPaymentModal(type: 'subscription' | 'portrait') {
    this.paymentType.set(type);
    this.showEmailModal.set(true);
  }

  closeModal() {
    this.showEmailModal.set(false);
    this.emailError.set(null);
  }

  proceedToPayment() {
    if (!this.email() || !/^\S+@\S+\.\S+$/.test(this.email())) {
      this.emailError.set('Пожалуйста, введите корректный email.');
      return;
    }
    if (!this.consent()) {
      this.emailError.set('Необходимо ваше согласие на рассылку.');
      return;
    }
    this.emailError.set(null);
    this.stateService.userEmail.set(this.email());
    
    // In a REAL application, you MUST get the confirmation_token from your backend.
    // Your backend would make a secure API call to YooKassa to create a payment
    // and would return the token to the frontend.
    // Hardcoding it here is for DEMONSTRATION purposes ONLY and will NOT work with real payments.
    const MOCK_CONFIRMATION_TOKEN = 'confirmation_token_from_your_backend';

    const checkout = new YooCheckoutWidget({
      // Replace with your actual confirmation_token from the backend
      confirmation_token: MOCK_CONFIRMATION_TOKEN, 
      // Replace with your real return_url
      return_url: `${window.location.origin}${window.location.pathname}?payment=success`, 
      // Add other customization options as needed
      customization: {
        colors: {
          control_primary: '#D4AF37'
        }
      },
      error_callback: (error: any) => {
        console.error('YooKassa error:', error);
        // Handle payment errors
        window.location.href = `${window.location.origin}${window.location.pathname}?payment=cancelled`;
      }
    });

    checkout.render('payment-form-container')
      .then(() => {
        console.log('YooKassa widget rendered');
        this.closeModal();
      })
      .catch((err: any) => {
        console.error('Failed to render YooKassa widget', err);
        this.emailError.set('Не удалось инициализировать оплату. Попробуйте позже.');
      });

    // For this static demo, since we can't get a real token, we will simulate a successful payment flow.
    // COMMENT OUT the code below and UNCOMMENT the checkout code above when you have a backend.
    console.warn("DEMO MODE: Simulating successful payment flow. Implement backend for real payments.");
    setTimeout(() => {
        window.location.href = `${window.location.origin}${window.location.pathname}?payment=success`;
    }, 2000);
  }
}
