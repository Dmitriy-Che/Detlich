
import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { AnalysisResult, HoroscopeResult, QuizData } from './state.service';

// It is crucial that the API key is handled securely and not exposed in client-side code.
// The `process.env.API_KEY` is a placeholder for an environment variable
// that should be substituted during the build process or provided by the hosting environment.
declare var process: any;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set. Gemini API calls will fail.");
      // In a real app, you might want to disable features or show a message to the user.
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getPersonalityAnalysis(quizData: QuizData): Promise<AnalysisResult> {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: quizData.photoBase64,
      },
    };
    
    let recommendationsPrompt = `Дай 5-7 коротких, практичных и позитивных советов по стилю, которые помогут подчеркнуть его индивидуальность. Советы должны быть в формате маркированного списка и охватывать одежду, причёску, аксессуары.`;
    if (quizData.gender !== 'male') {
      recommendationsPrompt += ` Также включи советы по макияжу.`;
    } else {
      recommendationsPrompt += ` Также включи советы по уходу (грумингу). Не включай советы по макияжу.`;
    }

    const textPart = {
      text: `
      Проанализируй это фото и данные человека: Рост ${quizData.height} см, Вес ${quizData.weight} кг, Возраст ${quizData.age}, Пол ${quizData.gender}.
      Действуй как мудрый, добрый и вдохновляющий эзотерический стилист и психолог.
      Твоя цель — помочь человеку раскрыть свою внутреннюю красоту и силу.
      
      Ответь в формате JSON, используя схему.
      - archetype: Определи типаж внешности (например, Романтик, Драматик, Натурал, Классик, Гамин), дай ему красивое, метафорическое название.
      - description: Напиши краткое, но очень вдохновляющее и позитивное описание личности и характера этого человека, основываясь на его внешности. Подчеркни его уникальные черты и внутренний свет.
      - recommendations: ${recommendationsPrompt}
      `
    };

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    archetype: { type: Type.STRING },
                    description: { type: Type.STRING },
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
      });
      
      const jsonResponse = JSON.parse(response.text);

      // Generate preview images in parallel
      const previewImages = await Promise.all([
        this.generateOutfitImage(jsonResponse.archetype, quizData.gender, 'low'),
        this.generateOutfitImage(`${jsonResponse.archetype} style, another variation`, quizData.gender, 'low'),
      ]);

      return { ...jsonResponse, previewImages };

    } catch (error) {
      console.error('Error getting personality analysis:', error);
      // Return a fallback object on error to prevent app crash
      return {
        archetype: 'Загадочная Душа',
        description: 'Произошла магическая аномалия при связи со звездами. Пожалуйста, попробуйте еще раз. Ваша уникальность настолько велика, что сбила с толку наши инструменты. Это хороший знак!',
        recommendations: ['Доверяйте своей интуиции.', 'Носите цвета, которые радуют вашу душу.', 'Улыбайтесь отражению в зеркале.'],
        previewImages: ['https://picsum.photos/300/400?random=1', 'https://picsum.photos/300/400?random=2']
      };
    }
  }

  async generateOutfitImage(archetype: string, gender: string, quality: 'low' | 'high'): Promise<string> {
    const genderString = gender === 'male' ? 'male' : 'female';
    const qualityPrompt = quality === 'high' 
        ? 'ultra high detail, masterpiece, photorealistic' 
        : 'high resolution, positive vibe';

    const prompt = `Realistic full-body portrait of a ${genderString} person in ${archetype}-inspired outfit, modern casual style, ${qualityPrompt}. The person should look confident and happy. Neutral studio background.`;
    try {
        const response = await this.ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4', // Portrait aspect ratio is better for full-body outfits
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error('Error generating outfit image:', error);
        return `https://picsum.photos/seed/${archetype}/300/400`; // Fallback image with new aspect ratio
    }
  }

  async getHoroscope(birthDate: string): Promise<HoroscopeResult> {
    const prompt = `
    Составь персональный, вдохновляющий и добрый гороскоп на ближайшие 30 дней для человека с датой рождения ${birthDate}.
    Гороскоп должен быть сфокусирован на саморазвитии и позитивных возможностях.
    Ответь в формате JSON, используя предоставленную схему.
    Каждое предсказание должно быть 2-3 предложения.
    - love: Прогноз в сфере любви, отношений с собой и окружающими.
    - career: Прогноз в сфере карьеры, самореализации и финансов.
    - health: Прогноз в сфере здоровья, энергии и благополучия.
    `;
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        love: { type: Type.STRING },
                        career: { type: Type.STRING },
                        health: { type: Type.STRING }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch(error) {
        console.error('Error getting horoscope:', error);
        return {
            love: 'Звёзды говорят, что сейчас лучшее время, чтобы полюбить и принять себя. Окружите себя теплом и заботой, и вы увидите, как мир ответит вам тем же.',
            career: 'Ваша креативная энергия на пике! Не бойтесь предлагать смелые идеи и начинать новые проекты. Вселенная поддержит ваши самые амбициозные начинания.',
            health: 'Прислушайтесь к своему телу. Медитации и прогулки на свежем воздухе принесут гармонию и наполнят вас силой для новых свершений.'
        }
    }
  }
}
