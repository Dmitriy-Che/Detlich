import { Component, ChangeDetectionStrategy, OnInit, AfterViewInit, inject, NgZone, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService, User } from '../../services/state.service';

declare var Telegram: any;

@Component({
  selector: 'app-landing',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit, AfterViewInit {
  @ViewChild('telegramLogin') telegramLogin!: ElementRef;

  private stateService = inject(StateService);
  private ngZone = inject(NgZone);
  
  isMiniApp = signal(false);
  widgetLoadError = signal(false);
  currentDomain = signal('');

  ngOnInit(): void {
    try {
      this.currentDomain.set(window.location.hostname);
      if (typeof Telegram !== 'undefined' && Telegram.WebApp && Telegram.WebApp.initData) {
        this.isMiniApp.set(true);
        const tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
          const user: User = {
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

  ngAfterViewInit(): void {
    if (!this.isMiniApp()) {
      (window as any).onTelegramAuth = (user: User) => {
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

  demoLogin(): void {
    const dummyUser: User = {
      id: 123456789,
      first_name: 'Гость',
    };
    this.stateService.login(dummyUser);
  }
}
