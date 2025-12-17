
import { Component, ChangeDetectionStrategy, OnInit, AfterViewInit, inject, NgZone, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService } from '../../services/state.service.js';

declare var Telegram: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
<div class="flex flex-col items-center justify-center text-center p-6 bg-white/70 rounded-3xl shadow-lg backdrop-blur-sm">

  <!-- Logo -->
  <div class="mb-4 p-1 bg-white/80 rounded-full shadow-md">
     <img src="./logo_detlich.png" alt="Логотип Детейлинг Личности" class="w-28 h-28 rounded-full object-cover">
  </div>

  <h1 class="font-serif text-4xl md:text-5xl font-bold mb-2 text-dark-purple">
    Детейлинг личности
  </h1>
  <p class="font-sans text-md mb-4 max-w-sm text-dark-purple/80">
    Загрузите своё селфи — и ИИ раскроет вашу уникальную внутреннюю магию, поможет стать гармоничнее и увереннее в себе.
  </p>

  <div class="text-left font-sans text-sm text-dark-purple/90 mb-4 p-4 bg-powder-pink/30 rounded-xl w-full max-w-sm">
    <p class="font-semibold mb-2">Вы получите:</p>
    <ul class="space-y-1">
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.1s;">•</span><span>Персональный типаж внешности и характера (вдохновлён Kibbe, адаптирован для мужчин и женщин)</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.3s;">•</span><span>Рекомендации по стилю одежды, причёске и уходу за собой (макияж и аксессуары для женщин, груминг и стиль для мужчин)</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.5s;">•</span><span>Персонализированные образы в рекомендованном стиле (реалистичные луки на моделях — тизер бесплатно, примерка на вас — по подписке)</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.2s;">•</span><span>Гармоничный интерьер дома под вашу энергию (цвета, материалы, примеры комнат)</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.4s;">•</span><span>Питание и полезные привычки для здоровья, энергии и сияния</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.6s;">•</span><span>Гороскоп на 30 дней с практическими советами от звёзд (любовь, карьера, благополучие)</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.1s;">•</span><span>Подходящие кристаллы и камни-талисманы для защиты, успеха и баланса</span></li>
      <li class="flex items-start"><span class="inline-block animate-sparkle text-gold-accent mr-2" style="animation-delay: 0.3s;">•</span><span>Сходство со знаменитостями — узнайте, на кого вы похожи по внешности и харизме (топ-3 с объяснением)</span></li>
    </ul>
  </div>
  
  <p class="font-sans text-sm mb-4 max-w-sm text-dark-purple/80">
    Бесплатно — базовый анализ и тизеры всех возможностей.<br>
    Полный детейлинг с детальными рекомендациями, эксклюзивными визуалами и обновлениями — подписка 499 ₽/мес или разовые покупки.
  </p>

  @if (isMiniApp()) {
    <p class="font-serif text-lg mb-6 max-w-sm text-dark-purple font-semibold animate-pulse">
      Начните своё преображение 💎
    </p>
  } @else {
    <p class="font-serif text-lg mb-6 max-w-sm text-dark-purple font-semibold">
      Войдите через Telegram и начните сиять уже сегодня 💎
    </p>
    
    <div class="mb-4 animate-glow rounded-2xl p-0.5">
      <div #telegramLogin></div>
    </div>
    
    @if (widgetLoadError()) {
      <div class="mt-2 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm text-left max-w-sm animate-fade-in">
        <p class="font-bold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-5.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clip-rule="evenodd" />
          </svg>
          Ошибка загрузки кнопки
        </p>
        <p>Похоже, домен этого сайта не добавлен в настройки вашего Telegram-бота. Чтобы это исправить:</p>
        <ol class="list-decimal list-inside mt-2 space-y-1 font-sans">
          <li>Откройте Telegram и найдите <strong>&#64;BotFather</strong>.</li>
          <li>Отправьте команду <code>/mybots</code> и выберите <code>&#64;detlich_bot</code>.</li>
          <li>Нажмите "Bot Settings", затем "Domain".</li>
          <li>Отправьте ему текущий домен:
            <code class="bg-red-200 text-red-900 font-mono p-1 rounded text-xs">{{ currentDomain() }}</code>
          </li>
        </ol>
        <p class="mt-2">После этого обновите страницу.</p>
      </div>
    }

    <!-- This button can be hidden in production by commenting it out -->
    <div class="mt-4 text-center">
      <button (click)="demoLogin()" class="text-xs text-dark-purple/70 bg-white/50 px-3 py-1 rounded-full hover:bg-white/80 transition-colors">
        Тестовый вход (демо-режим)
      </button>
      <p class="text-xs text-dark-purple/50 mt-1 max-w-xs">
        Пропустить авторизацию и посмотреть полный flow (только для теста)
      </p>
    </div>
  }
</div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('telegramLogin') telegramLogin!: ElementRef;

  stateService = inject(StateService);
  ngZone = inject(NgZone);
  
  isMiniApp = signal(false);
  widgetLoadError = signal(false);
  currentDomain = signal('');

  ngOnInit() {
    try {
      this.currentDomain.set(window.location.hostname);
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initData) {
        this.isMiniApp.set(true);
        const tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
          const user = {
            id: tg.initDataUnsafe.user.id,
            first_name: tg.initDataUnsafe.user.first_name,
            photo_url: tg.initDataUnsafe.user.photo_url,
          };
          
          setTimeout(() => {
            this.ngZone.run(() => {
              this.stateService.login(user);
            });
          }, 100);

        } else {
          console.warn("Mini App mode, but no user data found.");
        }
      } else {
         console.log("Running in standard browser mode.");
      }
    } catch (e) {
      console.error("Telegram WebApp script not loaded or failed.", e);
    }
  }

  ngAfterViewInit() {
    if (!this.isMiniApp()) {
      (window as any).onTelegramAuth = (user: any) => {
        this.ngZone.run(() => {
          this.stateService.login(user);
        });
      };

      const script = document.createElement('script');
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.setAttribute('data-telegram-login', 'detlich_bot'); 
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      this.telegramLogin.nativeElement.appendChild(script);

      // Check if the widget loaded successfully after a delay
      setTimeout(() => {
        this.ngZone.run(() => {
          const iframe = this.telegramLogin.nativeElement.querySelector('iframe');
          if (!iframe) {
            this.widgetLoadError.set(true);
          }
        });
      }, 3000);
    }
  }

  demoLogin() {
    const dummyUser = {
      id: 123456789,
      first_name: 'Гость',
    };
    this.stateService.login(dummyUser);
  }
}
