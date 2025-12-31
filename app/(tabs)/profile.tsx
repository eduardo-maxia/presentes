import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useReminders } from '@/hooks/useReminders';

export default function ProfileScreen() {
  const { profile, isAnonymous, signOut } = useAuth();
  const { colors, themeMode, setTheme, isDark } = useTheme();
  const { hasPermission, requestNotificationPermission } = useReminders();

  const handleSignOut = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair? Seus dados serão mantidos localmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        'Permissão negada',
        'Para receber lembretes de aniversários e eventos, habilite as notificações nas configurações do app.'
      );
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      {/* Profile Header */}
      <View className="p-6 items-center border-b" style={{ borderColor: colors.border }}>
        <View
          style={{ backgroundColor: colors.primary }}
          className="w-24 h-24 rounded-full items-center justify-center mb-3"
        >
          <Text className="text-white text-4xl font-bold">
            {profile?.display_name?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={{ color: colors.foreground }} className="text-2xl font-bold">
          {profile?.display_name || 'Usuário'}
        </Text>
        {isAnonymous && (
          <View
            style={{ backgroundColor: colors.accent }}
            className="px-3 py-1 rounded-full mt-2"
          >
            <Text style={{ color: colors.foreground }} className="text-sm font-medium">
              Modo Anônimo
            </Text>
          </View>
        )}
      </View>

      {/* Anonymous User Section */}
      {isAnonymous && (
        <View className="p-4 m-4 rounded-lg" style={{ backgroundColor: colors.backgroundSecondary }}>
          <Text style={{ color: colors.foreground }} className="text-lg font-semibold mb-2">
            🔒 Proteja seus dados
          </Text>
          <Text style={{ color: colors.foregroundSecondary }} className="mb-3">
            Faça login para sincronizar seus dados e acessá-los de qualquer dispositivo.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary }}
            className="py-3 rounded-lg items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold">Fazer Login</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Section */}
      <View className="p-4">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-semibold mb-2 px-2"
        >
          APARÊNCIA
        </Text>

        {/* Theme Toggle */}
        <View
          className="p-4 rounded-lg mb-2"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text style={{ color: colors.foreground }} className="text-base font-medium">
                Tema Escuro
              </Text>
              <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                {themeMode === 'system' ? 'Automático (Sistema)' : themeMode === 'dark' ? 'Ativado' : 'Desativado'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? colors.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Auto Theme */}
        <TouchableOpacity
          className="p-4 rounded-lg mb-2"
          style={{ backgroundColor: colors.backgroundSecondary }}
          onPress={() => setTheme('system')}
          activeOpacity={0.7}
        >
          <View className="flex-row justify-between items-center">
            <Text style={{ color: colors.foreground }} className="text-base">
              Usar tema do sistema
            </Text>
            {themeMode === 'system' && (
              <Text style={{ color: colors.primary }}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View className="p-4">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-semibold mb-2 px-2"
        >
          NOTIFICAÇÕES
        </Text>

        <View
          className="p-4 rounded-lg mb-2"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text style={{ color: colors.foreground }} className="text-base font-medium">
                Lembretes Locais
              </Text>
              <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                {hasPermission ? 'Ativado' : 'Desativado'}
              </Text>
            </View>
            {!hasPermission && (
              <TouchableOpacity
                onPress={handleRequestNotifications}
                style={{ backgroundColor: colors.primary }}
                className="px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">Ativar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Account Section */}
      {!isAnonymous && (
        <View className="p-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2 px-2"
          >
            CONTA
          </Text>

          <TouchableOpacity
            className="p-4 rounded-lg"
            style={{ backgroundColor: colors.backgroundSecondary }}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#FF3B30' }} className="text-base font-medium">
              Sair
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About Section */}
      <View className="p-4 pb-8">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-semibold mb-2 px-2"
        >
          SOBRE
        </Text>

        <View
          className="p-4 rounded-lg"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <Text style={{ color: colors.foreground }} className="text-base mb-1">
            Presentes - Gift Ideas
          </Text>
          <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
            Versão 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
