
import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-share',
  imports: [CommonModule],
  templateUrl: './share.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareComponent {
  shareText = input.required<string>();
  shareTitle = input.required<string>();
  
  showOptions = signal(false);
  copied = signal(false);
  
  private appUrl = window.location.origin;

  toggleOptions() {
    this.showOptions.update(value => !value);
  }
  
  share(platform: 'telegram' | 'vk') {
    const text = encodeURIComponent(this.shareText());
    const title = encodeURIComponent(this.shareTitle());
    const url = encodeURIComponent(this.appUrl);
    let shareUrl = '';

    if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
    } else if (platform === 'vk') {
      shareUrl = `https://vk.com/share.php?url=${url}&title=${title}&description=${text}`;
    }
    
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    this.showOptions.set(false);
  }
  
  copyLink() {
    if (this.copied()) return;

    navigator.clipboard.writeText(this.appUrl).then(() => {
      this.copied.set(true);
      setTimeout(() => {
        this.copied.set(false);
        this.showOptions.set(false);
      }, 2000);
    }).catch(err => console.error('Failed to copy text: ', err));
  }
}
