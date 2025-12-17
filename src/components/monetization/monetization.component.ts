
import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service.js';
import { GeminiService } from '../../services/gemini.service.js';
import { ShareComponent } from '../share/share.component.js';

declare var YooCheckoutWidget: any;

@Component({
  selector: 'app-monetization',
  standalone: true,
  imports: [CommonModule, FormsModule, ShareComponent],
  template: `
<div class="w-full max-w-md mx-auto p-6 bg-white/80 rounded-3xl shadow-lg backdrop-blur-sm animate-glow">
  
  @if (paymentStatus() === 'success') {
    <div class="text-center">
      <h2 class="font-serif text-3xl font-bold text-green-600 mb-4">Оплата прошла успешно!</h2>
      <p class="font-sans mb-6">Ваш полный отчёт и портрет доступны ниже. Мы также отправили копию вам на почту {{ stateService.userEmail() }}.</p>
      
      @if(isLoadingPaidContent()) {
        <div class="flex justify-center items-center p-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-gold-accent"></div>
        </div>
      } @else {
        <div class="text-left bg-beige/50 p-4 rounded-xl space-y-6">
          <div>
            <h3 class="font-serif text-2xl font-semibold">Полный детейлинг личности</h3>
            <p class="font-sans mt-2">{{ paidContent().fullReport }}</p>
          </div>
          
          @if(paidContent().paidPortrait; as portrait) {
            <div>
              <h3 class="font-serif text-2xl font-semibold">Ваш персональный образ в стиле</h3>
              <img [src]="portrait" (click)="showImage(portrait)" alt="Персональный образ в стиле" class="rounded-lg shadow-md w-full h-auto object-cover aspect-[3/4] mt-2 cursor-pointer hover:opacity-90 transition-opacity">
            </div>
          }

          <!-- Full Crystals Section -->
          @if(paidContent().crystals) {
            <div>
              <h3 class="font-serif text-2xl font-semibold">Твои камни-талисманы</h3>
              <div class="space-y-4 mt-2">
                @for(crystal of paidContent().crystals; track crystal.name) {
                  <div class="flex items-start gap-4 p-3 bg-white/50 rounded-lg">
                    <img [src]="crystal.photoUrl" (click)="showImage(crystal.photoUrl)" [alt]="crystal.name" class="w-20 h-20 rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity">
                    <div>
                      <h4 class="font-serif text-lg font-bold">{{crystal.name}}</h4>
                      <p class="font-sans text-sm">{{crystal.description}}</p>
                      <p class="font-sans text-sm mt-1 italic"><strong>Практика:</strong> {{crystal.usage}}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
           <!-- Full Celebrities Section -->
          @if(paidContent().celebrities) {
            <div>
              <h3 class="font-serif text-2xl font-semibold">Сходство со знаменитостями</h3>
              <div class="space-y-4 mt-2">
                @for(celebrity of paidContent().celebrities; track celebrity.name) {
                  <div class="p-3 bg-white/50 rounded-lg">
                    <div class="flex items-center gap-4">
                      <img [src]="celebrity.photoUrl" (click)="showImage(celebrity.photoUrl)" [alt]="celebrity.name" class="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity">
                      <div>
                        <h4 class="font-serif text-lg font-bold">{{celebrity.name}}</h4>
                        <p class="font-sans text-sm font-bold text-gold-accent">Сходство: {{celebrity.similarity}}%</p>
                      </div>
                    </div>
                    <p class="font-sans text-sm mt-2 italic">"{{celebrity.reason}}"</p>
                  </div>
                }
              </div>
            </div>
          }
          <!-- Full Interior Design Section -->
          @if(paidContent().interiorDesign) {
            <div>
              <h3 class="font-serif text-2xl font-semibold">Гармония твоего дома</h3>
              <div class="space-y-2 mt-2">
                @for(recommendation of paidContent().interiorDesign.recommendations; track recommendation) {
                    <div class="p-3 bg-white/50 rounded-lg">
                       <p class="font-sans text-sm">{{recommendation}}</p>
                    </div>
                }
              </div>
              <h4 class="font-serif text-lg font-bold mt-4 mb-2">Примеры для вдохновения:</h4>
              <div class="grid grid-cols-2 gap-2">
                @for(image of paidContent().interiorDesign.exampleImages; track image) {
                    <img [src]="image" (click)="showImage(image)" [alt]="'Пример интерьера'" class="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity w-full h-auto aspect-[3/2]">
                }
              </div>
            </div>
          }
        </div>
        <app-share [shareText]="shareText" [shareTitle]="shareTitle"></app-share>
      }
    </div>
  } @else {
    @if (paymentStatus() === 'cancelled') {
        <p class="text-center text-red-600 bg-red-100 p-3 rounded-lg mb-4">Платёж был отменён. Вы можете попробовать снова в любое время.</p>
    }
    <div class="text-center">
      <h1 class="font-serif text-4xl font-bold mb-2">Раскрой свой потенциал</h1>
      <p class="font-sans text-lg mb-8 text-dark-purple/80">Ты на пороге великих открытий. Выбери свой путь к полной гармонии.</p>
    </div>

    <div class="space-y-4">
      <div class="p-6 bg-powder-pink/60 rounded-2xl border border-gold-accent/50 shadow-sm">
        <h3 class="font-serif text-2xl font-semibold">Полный детейлинг личности</h3>
        <p class="font-sans text-sm text-dark-purple/70 mt-1 mb-3">Подробный анализ, камни-талисманы, сходство со знаменитостями и эксклюзивные образы.</p>
        <button (click)="openPaymentModal('subscription')" class="w-full bg-gold-accent text-white font-bold py-2 px-4 rounded-xl hover:opacity-90 transition-opacity">
          Подписка – 499 ₽/мес
        </button>
      </div>
      
      <div class="p-6 bg-mint/60 rounded-2xl border border-gold-accent/50 shadow-sm">
        <h3 class="font-serif text-2xl font-semibold">Персональный образ в стиле</h3>
        <p class="font-sans text-sm text-dark-purple/70 mt-1 mb-3">Уникальный нейро-арт образ, созданный на основе твоего типажа и энергии.</p>
        <button (click)="openPaymentModal('portrait')" class="w-full bg-dark-purple text-white font-bold py-2 px-4 rounded-xl hover:bg-dark-purple/90 transition-opacity">
          Разово – 790 ₽
        </button>
      </div>
    </div>
  }
</div>

<!-- Email Collection Modal -->
@if (showEmailModal()) {
  <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="closeModal()">
    <div class="bg-beige rounded-3xl p-8 shadow-2xl w-full max-w-sm" (click)="$event.stopPropagation()">
      <h3 class="font-serif text-2xl font-bold text-center mb-2">Почти готово!</h3>
      <p class="text-center font-sans text-dark-purple/80 mb-6">Для получения чека, полного отчёта и эксклюзивных рекомендаций укажите ваш email. Полезный контент без спама ✨</p>
      
      <div class="space-y-4">
        <div>
          <label for="email" class="font-sans text-sm font-medium">Ваш Email</label>
          <input type="email" id="email" name="email" [(ngModel)]="email" required placeholder="example@mail.com" class="mt-1 block w-full bg-white border border-lavender rounded-lg p-2 focus:ring-gold-accent focus:border-gold-accent transition">
        </div>
        
        <div class="flex items-start">
          <input id="consent" name="consent" type="checkbox" [(ngModel)]="consent" class="h-4 w-4 text-gold-accent border-gray-300 rounded focus:ring-gold-accent mt-1">
          <label for="consent" class="ml-2 text-sm font-sans text-dark-purple/80">
            Я согласен(-на) на рассылку полезных советов и обновлений.
          </label>
        </div>
      </div>
      
      @if (emailError()) {
        <p class="text-sm text-red-600 text-center mt-4">{{ emailError() }}</p>
      }
      
      <button (click)="proceedToPayment()" class="mt-6 w-full bg-gold-accent text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity">
        Оплатить
      </button>
      
      <div id="payment-form-container" class="mt-4"></div>
    </div>
  </div>
}

<!-- Image Modal -->
@if (selectedImage(); as imageUrl) {
  <div (click)="hideImage()" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <img [src]="imageUrl" (click)="$event.stopPropagation()" alt="Пример образа в увеличенном виде" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl" style="max-width: 1000px; max-height: 1000px;">
  </div>
}
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonetizationComponent implements OnInit {
  stateService = inject(StateService);
  geminiService = inject(GeminiService);

  showEmailModal = signal(false);
  paymentType = signal<null | 'subscription' | 'portrait'>(null);

  email = signal(this.stateService.userEmail() || '');
  consent = signal(false);
  emailError = signal<string | null>(null);
  
  paymentStatus = signal<'success' | 'cancelled' | null>(null);
  paidContent = signal<any>({});
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
            celebrities: premiumData.celebrities,
            interiorDesign: premiumData.interiorDesign
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
