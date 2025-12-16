import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';
import { AnalysisResult, HoroscopeResult, QuizData, PaidContent, CrystalInfo, CelebrityMatch, InteriorDesign } from './state.service';

// It is crucial that the API key is handled securely and not exposed in client-side code.
// The `process.env.API_KEY` is a placeholder for an environment variable
// that should be substituted during the build process or provided by the hosting environment.
declare var process: any;

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private userFriendlyErrorMessage = 'Звёзды временно перегружены: слишком много желающих узнать свою судьбу! Пожалуйста, попробуйте через несколько минут.';

  constructor() {
    if (!process.env.API_KEY) {
      console.error("API_KEY environment variable not set. Gemini API calls will fail.");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getPersonalityAnalysis(quizData: QuizData): Promise<AnalysisResult> {
    const imagePart = {
      inlineData: {
        mimeType: quizData.photoMimeType,
        data: quizData.photoBase64,
      },
    };
    
    let recommendationsPrompt = `Дай 5-7 коротких, практичных и позитивных советов по стилю. Советы должны быть в формате маркированного списка.`;
    if (quizData.gender !== 'male') {
      recommendationsPrompt += ` Включи советы по одежде, причёске, аксессуарам и макияжу.`;
    } else {
      recommendationsPrompt += ` Включи советы по одежде, причёске, аксессуарам и уходу (грумингу).`;
    }

    const textPart = {
      text: `
      Проанализируй фото и данные человека: Рост ${quizData.height} см, Вес ${quizData.weight} кг, Возраст ${quizData.age}, Пол ${quizData.gender}.
      Действуй как мудрый, добрый и вдохновляющий эзотерический стилист.
      Твоя цель — помочь человеку раскрыть свою внутреннюю красоту.
      
      Ответь в формате JSON, используя схему.
      - archetype: Определи типаж внешности (например, Романтик, Драматик), дай ему красивое, метафорическое название.
      - description: Напиши краткое, вдохновляющее описание личности, основываясь на внешности.
      - recommendations: ${recommendationsPrompt}
      - crystalTeaser: Порекомендуй 1-2 подходящих кристалла с очень коротким описанием (2-4 слова).
      - celebrityTeaser: Назови 1 знаменитость, чья энергия или стиль похожи на этого человека, с очень коротким пояснением.
      - interiorTeaser: Дай очень краткое (1-2 предложения) описание гармоничного интерьера для этого типажа. Упомяни ключевые цвета и материалы.
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
                    recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                    crystalTeaser: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, shortDescription: { type: Type.STRING } } } },
                    celebrityTeaser: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, shortDescription: { type: Type.STRING } } } },
                    interiorTeaser: { type: Type.STRING }
                }
            }
        }
      });
      
      const jsonResponse = JSON.parse(response.text);

      const previewImages = await Promise.all([
        this.generateOutfitImage(jsonResponse.archetype, quizData.gender, 'low'),
        this.generateOutfitImage(`${jsonResponse.archetype} style, another variation`, quizData.gender, 'low'),
      ]);
      
      const archetypeSlug = jsonResponse.archetype.replace(/\s+/g, '_').toLowerCase();

      const result: AnalysisResult = { 
        ...jsonResponse, 
        previewImages,
        interiorTeaser: {
            description: jsonResponse.interiorTeaser, // String from Gemini
            previewImages: [
                `https://picsum.photos/seed/${archetypeSlug}_interior1/300/300`,
                `https://picsum.photos/seed/${archetypeSlug}_interior2/300/300`
            ]
        }
      };
      
      return result;

    } catch (error) {
      console.error('Error getting personality analysis:', error);
      return {
        archetype: 'Загадочная Душа',
        description: this.userFriendlyErrorMessage,
        recommendations: ['Доверяйте своей интуиции.', 'Носите цвета, которые радуют вашу душу.'],
        previewImages: ['https://picsum.photos/300/400?random=1', 'https://picsum.photos/300/400?random=2'],
        crystalTeaser: [{ name: 'Лунный камень', shortDescription: 'интуиция и спокойствие' }],
        celebrityTeaser: [{ name: 'загадочная звезда', shortDescription: 'утонченная энергия' }],
        interiorTeaser: {
            description: 'Создайте пространство, наполненное светом и натуральными материалами, чтобы отразить вашу внутреннюю гармонию.',
            previewImages: ['https://picsum.photos/300/300?random=3', 'https://picsum.photos/300/300?random=4']
        }
      };
    }
  }
  
  private getZodiacSign(birthDate: string): string {
    const date = new Date(birthDate);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Водолей";
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Рыбы";
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Овен";
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Телец";
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Близнецы";
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Рак";
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Лев";
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Дева";
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Весы";
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Скорпион";
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Стрелец";
    return "Козерог";
  }

  async getPremiumContent(quizData: QuizData, birthDate: string, archetype: string): Promise<Omit<PaidContent, 'fullReport' | 'paidPortrait'>> {
      const zodiacSign = this.getZodiacSign(birthDate);

      const crystalsPromise = this.getPremiumCrystals(archetype, zodiacSign);
      const celebritiesPromise = this.getPremiumCelebrities(quizData, archetype);
      const interiorPromise = this.getPremiumInterior(archetype, zodiacSign, quizData.gender);

      const [crystals, celebrities, interiorDesign] = await Promise.all([crystalsPromise, celebritiesPromise, interiorPromise]);

      return { crystals, celebrities, interiorDesign };
  }

  private async getPremiumCrystals(archetype: string, zodiacSign: string): Promise<CrystalInfo[]> {
    const prompt = `
      Порекомендуй 4-5 целебных кристаллов для личности с типажом "${archetype}" и знаком зодиака "${zodiacSign}".
      Для каждого кристалла предоставь: 'name', 'description' (свойства и польза в позитивном, вдохновляющем тоне), 
      'usage' (как его использовать для медитаций или в повседневной жизни), 
      и 'photoUrl' (используй плейсхолдер 'https://picsum.photos/seed/[название_камня_латиницей]/400/400').
      Ответь в формате JSON массива.
    `;
    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            usage: { type: Type.STRING },
                            photoUrl: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error getting premium crystals:', error);
        return [
            { name: 'Розовый кварц', description: this.userFriendlyErrorMessage, usage: 'Держите в руках во время медитации.', photoUrl: 'https://picsum.photos/seed/rose_quartz/400/400' }
        ];
    }
  }

  private async getPremiumCelebrities(quizData: QuizData, archetype: string): Promise<CelebrityMatch[]> {
    const imagePart = {
      inlineData: {
        mimeType: quizData.photoMimeType,
        data: quizData.photoBase64,
      },
    };
    const textPart = {
      text: `
        Проанализируй фото пользователя и его типаж "${archetype}".
        Найди топ-3 знаменитости (российские или международные), похожие по внешности, стилю или энергии.
        Для каждой предоставь: 'name', 'similarity' (процент от 70 до 95), 'reason' (краткое объяснение сходства), 
        и 'photoUrl' (используй плейсхолдер 'https://picsum.photos/seed/[имя_знаменитости_латиницей]/400/400').
        Ответь в формате JSON массива.
      `
    };

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            similarity: { type: Type.NUMBER },
                            reason: { type: Type.STRING },
                            photoUrl: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error('Error getting premium celebrities:', error);
        return [
            { name: 'Моника Беллуччи', similarity: 85, reason: this.userFriendlyErrorMessage, photoUrl: 'https://picsum.photos/seed/monica_bellucci/400/400' }
        ];
    }
  }
  
  private async getPremiumInterior(archetype: string, zodiacSign: string, gender: string): Promise<InteriorDesign> {
    const genderContext = gender === 'male' ? 'с более строгими, маскулинными акцентами' : 'с более мягкими, женственными акцентами';
    const prompt = `
      Создай подробные рекомендации по дизайну гармоничного домашнего интерьера для личности с типажом "${archetype}", знаком зодиака "${zodiacSign}", ${genderContext}.
      Тон должен быть вдохновляющим и практичным.
      Ответь в виде JSON объекта, который содержит массив 'recommendations' из 5-7 развернутых советов.
      Советы должны охватывать: цветовую палитру, ключевые материалы, стиль мебели, освещение и идеи для декора.
      Для каждого совета дай детальное описание.
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
                        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const parsedResponse = JSON.parse(response.text);
        const archetypeSlug = archetype.replace(/\s+/g, '_').toLowerCase();
        const exampleImages = [
            `https://picsum.photos/seed/${archetypeSlug}_livingroom/600/400`,
            `https://picsum.photos/seed/${archetypeSlug}_bedroom/600/400`,
            `https://picsum.photos/seed/${archetypeSlug}_kitchen/600/400`,
            `https://picsum.photos/seed/${archetypeSlug}_details/600/400`
        ];
        return { recommendations: parsedResponse.recommendations, exampleImages };
    } catch (error) {
        console.error('Error getting premium interior design:', error);
        return {
            recommendations: [
                this.userFriendlyErrorMessage,
                'Используйте натуральные материалы, такие как дерево и лен, для создания уютной атмосферы.',
                'Добавьте акценты вашего любимого цвета, чтобы пространство отражало вашу индивидуальность.'
            ],
            exampleImages: [
                'https://picsum.photos/seed/error_livingroom/600/400',
                'https://picsum.photos/seed/error_bedroom/600/400'
            ]
        };
    }
  }


  async generateOutfitImage(archetype: string, gender: string, quality: 'low' | 'high'): Promise<string> {
    const genderString = gender === 'male' ? 'a man' : 'a woman';
    const qualityPrompt = quality === 'high' 
        ? 'ultra high detail, masterpiece, photorealistic' 
        : 'high resolution, positive vibe';

    const prompt = `Realistic full-body portrait of ${genderString} in ${archetype}-inspired outfit, modern casual style, ${qualityPrompt}. The person should look confident and happy. Neutral studio background.`;
    try {
        const response = await this.ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '3:4',
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error('Error generating outfit image:', error);
        return `https://picsum.photos/seed/${archetype}/300/400`;
    }
  }

  async getHoroscope(birthDate: string): Promise<HoroscopeResult> {
    const prompt = `
    Составь персональный, вдохновляющий и добрый гороскоп на ближайшие 30 дней для человека с датой рождения ${birthDate}.
    Гороскоп должен быть сфокусирован на саморазвитии и позитивных возможностях.
    Ответь в формате JSON, используя предоставленную схему.
    Каждое предсказание должно быть 2-3 предложения.
    - love: Прогноз в сфере любви.
    - career: Прогноз в сфере карьеры.
    - health: Прогноз в сфере здоровья.
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
            love: this.userFriendlyErrorMessage,
            career: 'Ваша креативная энергия на пике! Не бойтесь предлагать смелые идеи.',
            health: 'Прислушайтесь к своему телу. Медитации и прогулки принесут гармонию.'
        }
    }
  }
}