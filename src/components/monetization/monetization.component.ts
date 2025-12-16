
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService, PaidContent } from '../../services/state.service';
import { GeminiService } from '../../services/gemini.service';
import { ShareComponent } from '../share/share.component';

declare var YooCheckoutWidget: any;

@Component({
  selector: 'app-monetization',
  imports: [CommonModule, FormsModule, ShareComponent],
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
  paidContent = signal<PaidContent>({});
  isLoadingPaidContent = signal(false);

  selectedImage = signal<string | null>(null);

  shareText = "Я получила полный Детейлинг своей личности! Это невероятно. ✨ Узнай и ты свой типаж, камни-талисманы и многое другое.";
  shareTitle = "Мой полный Детейлинг личности";

  ngOnInit() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success' && !this.paymentStatus()) {
      this.paymentStatus.set('success');
      this.loadPaidContent();
    } else if (urlParams.get('payment') === 'cancelled' && !this.paymentStatus()) {
        this.paymentStatus.set('cancelled');
    }
  }
  
  async loadPaidContent() {
    this.isLoadingPaidContent.set(true);
    const analysis = this.stateService.analysisResult();
    const quizData = this.stateService.quizData();
    const birthDate = this.stateService.birthDate();

    if(analysis && quizData && birthDate) {
        const [premiumData, portrait] = await Promise.all([
            this.geminiService.getPremiumContent(quizData, birthDate, analysis.archetype),
            this.geminiService.generateOutfitImage(analysis.archetype, quizData.gender, 'high')
        ]);
        
        this.paidContent.set({
            fullReport: "Это ваш полный отчет. Здесь будет детальный разбор вашего архетипа, расширенные рекомендации по стилю, нумерологический анализ и многое другое, что поможет вам на пути самопознания. Каждая деталь важна, и мы раскрываем их все для вас.",
            paidPortrait: portrait,
            crystals: premiumData.crystals,
            celebrities: premiumData.celebrities
        });
    }
    this.isLoadingPaidContent.set(false);
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
    const MOCK_CONFIRMATION_TOKEN = 'confirmation_token_from_your_backend';

    const checkout = new YooCheckoutWidget({
      confirmation_token: MOCK_CONFIRMATION_TOKEN, 
      return_url: `${window.location.origin}${window.location.pathname}?payment=success`, 
      customization: {
        colors: {
          control_primary: '#D4AF37'
        }
      },
      error_callback: (error: any) => {
        console.error('YooKassa error:', error);
        window.location.href = `${window.location.origin}${window.location.pathname}?payment=cancelled`;
      }
    });

    // For this static demo, we simulate a successful payment flow.
    console.warn("DEMO MODE: Simulating successful payment flow. Implement backend for real payments.");
    setTimeout(() => {
        const cleanUrl = window.location.href.split('?')[0];
        window.location.href = `${cleanUrl}?payment=success`;
    }, 2000);
  }

  showImage(imageUrl: string) {
    this.selectedImage.set(imageUrl);
  }

  hideImage() {
    this.selectedImage.set(null);
  }
}