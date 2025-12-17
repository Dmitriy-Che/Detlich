
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service.js';

@Component({
  selector: 'app-quiz-step-1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="w-full max-w-md mx-auto p-6 bg-white/80 rounded-3xl shadow-lg backdrop-blur-sm">
  <div class="text-center mb-6">
    <h2 class="font-serif text-3xl font-bold">Здравствуй, {{ user()?.first_name }}!</h2>
    <p class="font-sans text-md text-dark-purple/80 mt-2">Давай познакомимся поближе. Эта информация поможет звёздам дать точный ответ.</p>
  </div>
  
  <form (ngSubmit)="submit()" class="space-y-4">
    <div class="flex flex-col items-center">
      <label for="selfie-upload" class="cursor-pointer block w-full p-4 border-2 border-dashed rounded-xl text-center hover:bg-powder-pink transition-colors" [class.border-gold-accent]="!photoPreview()" [class.border-mint]="photoPreview()">
        @if (photoPreview()) {
          <img [src]="photoPreview()" alt="Предпросмотр селфи" class="w-32 h-32 object-cover rounded-full mx-auto mb-2">
          <span class="font-sans text-sm text-dark-purple/70">Нажми, чтобы выбрать другое фото</span>
        } @else {
          <div class="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gold-accent mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span class="font-sans font-medium">Загрузи своё селфи</span>
            <span class="font-sans text-xs text-dark-purple/60">Лучше всего подойдёт портрет в анфас</span>
          </div>
        }
      </label>
      <input id="selfie-upload" type="file" accept="image/*" capture="user" class="hidden" (change)="onFileSelected($event)">
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="height" class="font-sans text-sm font-medium">Рост (см)</label>
        <input type="number" id="height" name="height" [(ngModel)]="height" required class="mt-1 block w-full bg-beige/50 border border-lavender rounded-lg p-2 focus:ring-gold-accent focus:border-gold-accent transition">
      </div>
      <div>
        <label for="weight" class="font-sans text-sm font-medium">Вес (кг)</label>
        <input type="number" id="weight" name="weight" [(ngModel)]="weight" required class="mt-1 block w-full bg-beige/50 border border-lavender rounded-lg p-2 focus:ring-gold-accent focus:border-gold-accent transition">
      </div>
    </div>
    
    <div>
      <label for="age" class="font-sans text-sm font-medium">Возраст</label>
      <input type="number" id="age" name="age" [(ngModel)]="age" required class="mt-1 block w-full bg-beige/50 border border-lavender rounded-lg p-2 focus:ring-gold-accent focus:border-gold-accent transition">
    </div>
    
    <div>
      <label for="gender" class="font-sans text-sm font-medium">Пол</label>
      <select id="gender" name="gender" [(ngModel)]="gender" required class="mt-1 block w-full bg-beige/50 border border-lavender rounded-lg p-2 focus:ring-gold-accent focus:border-gold-accent transition">
        <option value="" disabled selected>Выберите пол</option>
        <option value="female">Женский</option>
        <option value="male">Мужской</option>
      </select>
    </div>

    @if (errorMessage()) {
        <p class="text-sm text-red-600 text-center">{{ errorMessage() }}</p>
    }
    
    <button type="submit" 
            class="w-full bg-gold-accent text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            [disabled]="!photoFile || !height || !weight || !age || !gender">
      Анализировать
    </button>
  </form>
</div>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizStep1Component {
  stateService = inject(StateService);
  user = this.stateService.user;

  photoPreview = signal<string | null>(null);
  photoFile: File | null = null;
  height: number | null = null;
  weight: number | null = null;
  age: number | null = null;
  gender = '';
  
  errorMessage = signal<string | null>(null);

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.photoPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.photoFile);
    }
  }
  
  toBase64(file: File): Promise<{ base64: string, mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // remove data:image/...;base64,
        const result = reader.result;
        // FIX: Check if result is a string before calling .split()
        // This prevents a runtime error if reader.result is an ArrayBuffer.
        if (typeof result === 'string') {
          const base64String = result.split(',')[1];
          resolve({ base64: base64String, mimeType: file.type });
        } else {
          reject(new Error('Could not read file as a string.'));
        }
      };
      reader.onerror = error => reject(error);
    });
  }

  async submit() {
    this.errorMessage.set(null);
    if (!this.photoFile || !this.height || !this.weight || !this.age || !this.gender || this.height <= 0 || this.weight <= 0 || this.age <= 0) {
        this.errorMessage.set('Пожалуйста, заполни все поля и загрузи фото, используя корректные значения.');
        return;
    }
    
    try {
        // FIX: The errors about 'base64' and 'mimeType' not existing on '{}' are resolved
        // by adding a specific return type Promise<{ base64: string, mimeType: string }> to the toBase64 method.
        const { base64: photoBase64, mimeType: photoMimeType } = await this.toBase64(this.photoFile);
        this.stateService.submitQuizStep1({
          photoBase64,
          photoMimeType,
          height: this.height,
          weight: this.weight,
          age: this.age,
          gender: this.gender,
        });
    } catch (error) {
        this.errorMessage.set('Не удалось обработать фото. Попробуй другое.');
        console.error("Error converting file to base64", error);
    }
  }
}
