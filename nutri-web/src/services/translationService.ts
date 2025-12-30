import axios from 'axios';

const API_URL = 'https://api.mymemory.translated.net/get';

export const translationService = {
    // Translate text
    async translate(text: string, from: string = 'es', to: string = 'en'): Promise<string> {
        try {
            if (!text) return '';
            // Cache check could go here

            const response = await axios.get(API_URL, {
                params: {
                    q: text,
                    langpair: `${from}|${to}`
                }
            });

            if (response.data && response.data.responseData) {
                return response.data.responseData.translatedText;
            }
            return text; // Fallback to original
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Fallback
        }
    },

    // Batch translate (Sequential to be kind to free API, or parallel limited)
    async translateBatch(texts: string[], from: string = 'en', to: string = 'es'): Promise<string[]> {
        // For free API, better to do it one by one or utilize their batch endpoint if exists (MyMemory doesn't standardly support array on free tier comfortably)
        // We will do parallel promises with basic catch
        const promises = texts.map(t => this.translate(t, from, to));
        return Promise.all(promises);
    }
};
