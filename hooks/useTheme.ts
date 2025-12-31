import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/types/database';

const THEME_STORAGE_KEY = 'theme_preference';

export function useTheme() {
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

  // Theme colors
  const colors = {
    background: isDark ? '#1C1C1E' : '#FFFFFF',
    backgroundSecondary: isDark ? '#2C2C2E' : '#F5F5F5',
    foreground: isDark ? '#FFFFFF' : '#1A1A1A',
    foregroundSecondary: isDark ? '#AEAEB2' : '#666666',
    border: isDark ? '#38383A' : '#E5E5E5',
    
    // Emotional colors (same in both themes)
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
    success: '#95E1D3',
    
    // Category colors
    practical: '#6C9BCF',
    emotional: '#FF6B6B',
    fun: '#FFE66D',
    experience: '#B28DFF',
    
    // Status colors
    idea: '#6C9BCF',
    bought: '#FFE66D',
    delivered: '#95E1D3',
  };

  return {
    themeMode,
    setTheme,
    toggleTheme,
    colorScheme,
    isDark,
    colors,
    loading,
  };
}
