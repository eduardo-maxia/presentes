import "../global.css";
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { colorScheme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }} className={colorScheme === 'dark' ? 'dark' : ''}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
