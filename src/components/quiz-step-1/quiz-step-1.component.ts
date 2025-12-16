
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateService } from '../../services/state.service';

@Component({
  selector: 'app-quiz-step-1',
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-step-1.component.html',
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
  gender: string = '';
  
  errorMessage = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.photoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview.set(e.target.result);
      };
      reader.readAsDataURL(this.photoFile);
    }
  }
  
  private toBase64(file: File): Promise<{ base64: string; mimeType: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // remove data:image/...;base64,
        const result = reader.result as string;
        const base64String = result.split(',')[1];
        resolve({ base64: base64String, mimeType: file.type });
      };
      reader.onerror = error => reject(error);
    });
  }

  async submit(): Promise<void> {
    this.errorMessage.set(null);
    if (!this.photoFile || !this.height || !this.weight || !this.age || !this.gender || this.height <= 0 || this.weight <= 0 || this.age <= 0) {
        this.errorMessage.set('Пожалуйста, заполни все поля и загрузи фото, используя корректные значения.');
        return;
    }
    
    try {
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
