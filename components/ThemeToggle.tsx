import { TouchableOpacity, View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { themeMode, setTheme, isDark, colors } = useTheme();
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 40,
    }).start();
  }, [isDark]);

  const handleToggle = () => {
    if (themeMode === 'system') {
      // Se está no modo system, muda para o oposto do tema atual do sistema
      setTheme(isDark ? 'light' : 'dark');
    } else {
      // Se já está em modo manual, só inverte
      setTheme(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 34],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.accent, colors.primary],
  });

  return (
    <View className="flex-row items-center gap-3">
      {/* System mode indicator */}
      {themeMode === 'system' && (
        <View
          style={{ backgroundColor: colors.backgroundSecondary }}
          className="px-3 py-1.5 rounded-lg"
        >
          <Ionicons name="phone-portrait" size={16} color={colors.foregroundSecondary} />
        </View>
      )}

      {/* Animated Toggle */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.8}
        className="rounded-2xl overflow-hidden"
        style={{
          width: 66,
          height: 32,
        }}
      >
        <Animated.View
          style={{
            backgroundColor,
            flex: 1,
            borderRadius: 16,
            padding: 2,
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateX }],
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            }}
          >
            <Ionicons 
              name={isDark ? 'moon' : 'sunny'} 
              size={16} 
              color={isDark ? colors.primary : colors.accent}
            />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}
