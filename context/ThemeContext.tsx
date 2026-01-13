import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/types/database';

const THEME_STORAGE_KEY = 'theme_preference';

interface ThemeContextType {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  loading: boolean;
}

interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  foreground: string;
  foregroundSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  practical: string;
  emotional: string;
  fun: string;
  experience: string;
  idea: string;
  bought: string;
  delivered: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [loading, setLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await setTheme(newMode);
  }, [themeMode, setTheme]);

  // Determine the actual color scheme to use
  const colorScheme = themeMode === 'system' 
    ? (systemColorScheme || 'light')
    : themeMode;

  const isDark = colorScheme === 'dark';

  // Theme colors - Improved dark mode with warmer tones and better contrast
  const colors: ThemeColors = {
    background: isDark ? '#0F1419' : '#FFFFFF',
    backgroundSecondary: isDark ? '#1A1F29' : '#F7F9FC',
    foreground: isDark ? '#E6EDF3' : '#0F1419',
    foregroundSecondary: isDark ? '#8B949E' : '#57606A',
    border: isDark ? '#30363D' : '#D0D7DE',
    
    // Emotional colors - adjusted for better dark mode visibility
    primary: isDark ? '#FF7B7B' : '#FF6B6B',
    secondary: isDark ? '#5EDDD4' : '#4ECDC4',
    accent: isDark ? '#FFF07D' : '#FFE66D',
    success: isDark ? '#A5F1E3' : '#95E1D3',
    
    // Category colors - enhanced for dark mode
    practical: isDark ? '#7CABDF' : '#6C9BCF',
    emotional: isDark ? '#FF7B7B' : '#FF6B6B',
    fun: isDark ? '#FFF07D' : '#FFE66D',
    experience: isDark ? '#C29DFF' : '#B28DFF',
    
    // Status colors - enhanced for dark mode
    idea: isDark ? '#7CABDF' : '#6C9BCF',
    bought: isDark ? '#FFF07D' : '#FFE66D',
    delivered: isDark ? '#A5F1E3' : '#95E1D3',
  };

  const value: ThemeContextType = {
    themeMode,
    setTheme,
    toggleTheme,
    colorScheme,
    isDark,
    colors,
    loading,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
