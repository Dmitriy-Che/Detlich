import { Component, ChangeDetectionStrategy, OnInit, inject, NgZone } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { StateService, User } from '../../services/state.service';

declare var Telegram: any;

@Component({
  selector: 'app-landing',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './landing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit {
  private stateService = inject(StateService);
  private ngZone = inject(NgZone);

  ngOnInit(): void {
    try {
      if (typeof Telegram !== 'undefined' && Telegram.WebApp) {
        const tg = Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe?.user) {
          const user: User = {
            id: tg.initDataUnsafe.user.id,
            first_name: tg.initDataUnsafe.user.first_name,
            photo_url: tg.initDataUnsafe.user.photo_url,
          };
          
          // Use a small timeout to let the view render before navigating
          // This prevents a jarring flash of content.
          setTimeout(() => {
            this.ngZone.run(() => {
              this.stateService.login(user);
            });
          }, 100);

        } else {
          console.log("Telegram WebApp user data not found. Running in browser mode.");
        }
      }
    } catch (e) {
      console.error("Telegram WebApp script not loaded or failed.", e);
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
