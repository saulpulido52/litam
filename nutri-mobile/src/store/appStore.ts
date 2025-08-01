import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { AppState } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AppStore extends AppState {
  // Acciones
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'es' | 'en') => void;
  toggleTheme: () => void;
  initializeLanguage: () => void;
}

// Función para detectar el idioma del dispositivo
const getDeviceLanguage = (): 'es' | 'en' => {
  const locales = Localization.getLocales();
  const languageCode = Array.isArray(locales) && locales.length > 0 ? locales[0].languageCode : null;
  if (languageCode === 'es') return 'es';
  if (languageCode === 'en') return 'en';
  return 'es'; // valor por defecto
};

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      theme: 'light',
      language: getDeviceLanguage(),

      // Acciones
      setTheme: (theme: 'light' | 'dark') =>
        set({
          theme,
        }),

      setLanguage: (language: 'es' | 'en') =>
        set({
          language,
        }),

      toggleTheme: () => {
        const currentTheme = get().theme;
        set({
          theme: currentTheme === 'light' ? 'dark' : 'light',
        });
      },

      initializeLanguage: () => {
        const deviceLanguage = getDeviceLanguage();
        set({
          language: deviceLanguage,
        });
      },
    }),
    {
      name: STORAGE_KEYS.LANGUAGE,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 