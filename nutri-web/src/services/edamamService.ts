import axios from 'axios';
import type { Food } from './foodService';

const APP_ID = import.meta.env.VITE_EDAMAM_APP_ID;
const APP_KEY = import.meta.env.VITE_EDAMAM_APP_KEY;
const BASE_URL = 'https://api.edamam.com/api/food-database/v2';

import { translationService } from './translationService';

export const edamamService = {
    async searchFoods(query: string): Promise<Food[]> {
        if (!APP_ID || !APP_KEY) {
            console.warn('⚠️ Edamam API Keys missing in .env');
            return [];
        }

        try {
            // 1. Translate Query (ES -> EN)
            const translatedQuery = await translationService.translate(query, 'es', 'en');
            console.log(`🔍 Edamam Search: "${query}" (Translated: "${translatedQuery}")`);

            const response = await axios.get(`${BASE_URL}/parser`, {
                params: {
                    app_id: APP_ID,
                    app_key: APP_KEY,
                    ingr: translatedQuery,
                    'nutrition-type': 'cooking',
                    language: 'es'
                },
                headers: {
                    'Accept-Language': 'es-ES,es;q=0.9',
                    'Content-Language': 'es'
                }
            });

            if (!response.data || !response.data.hints) {
                return [];
            }

            // 2. Map & Translate Results (EN -> ES)
            // Limit to top 15 to balance speed/cost
            const rawHints = response.data.hints.slice(0, 15);

            // Extract label names to translate batch
            const englishNames = rawHints.map((h: any) => h.food.label);

            // Translate names to Spanish
            let spanishNames: string[] = [];
            try {
                spanishNames = await translationService.translateBatch(englishNames, 'en', 'es');
            } catch (e) {
                console.warn('Translation failed, falling back to English names', e);
                spanishNames = englishNames;
            }

            return rawHints.map((item: any, index: number) => {
                const food = item.food;
                const measures = item.measures;
                const nutrients = food.nutrients || {};

                // Use translated name or fallback
                const displayName = spanishNames[index] || food.label;

                return {
                    id: `edamam_${food.foodId}`,
                    name: displayName,
                    calories: nutrients.ENERC_KCAL || 0,
                    protein: nutrients.PROCNT || 0,
                    carbohydrates: nutrients.CHOCDF || 0,
                    fats: nutrients.FAT || 0,
                    fiber: nutrients.FIBTG || 0,
                    unit: 'g',
                    serving_size: 100,
                    category: food.category || 'Generic',
                    is_custom: false,
                    image: food.image
                };
            });

        } catch (error) {
            console.error('❌ Edamam API Error:', error);
            return [];
        }
    }
};
