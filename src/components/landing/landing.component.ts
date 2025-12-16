
import { Component, ChangeDetectionStrategy, AfterViewInit, ElementRef, ViewChild, inject, NgZone } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService, User } from '../../services/state.service';

@Component({
  selector: 'app-landing',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements AfterViewInit {
  @ViewChild('telegramLogin') telegramLogin!: ElementRef;

  private stateService = inject(StateService);
  private ngZone = inject(NgZone);

  ngAfterViewInit(): void {
    // Expose a global function for the Telegram widget to call
    (window as any).onTelegramAuth = (user: User) => {
      this.ngZone.run(() => {
        this.stateService.login(user);
      });
    };

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    // REAL BOT USERNAME: @detlich_bot
    // For advanced features, the bot token might be needed on a backend.
    // Bot Token (for reference): 8595402394:AAHKtAGwqzifKaxbA7IzRUevmQIXddzYTRU
    script.setAttribute('data-telegram-login', 'detlich_bot'); 
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    this.telegramLogin.nativeElement.appendChild(script);
  }

  demoLogin(): void {
    const dummyUser: User = {
      id: 123456789,
      first_name: 'Гость',
      // photo_url: 'https://picsum.photos/seed/guest/100/100' // Optional placeholder
    };
    this.stateService.login(dummyUser);
  }
}
