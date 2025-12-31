import { Tabs } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { Text, View } from 'react-native';

// Simple icon components
function ContactsIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>👥</Text>;
}

function CalendarIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>📆</Text>;
}

function ProfileIcon({ color }: { color: string }) {
  return <Text style={{ fontSize: 24, color }}>👤</Text>;
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.foregroundSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Contatos',
          tabBarIcon: ({ color }) => <ContactsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
