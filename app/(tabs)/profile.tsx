import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useReminders } from '@/hooks/useReminders';
import { Ionicons } from '@expo/vector-icons';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProfileScreen() {
  const { profile, isAnonymous, signOut, signInWithGoogle } = useAuth();
  const { colors, themeMode, setTheme, isDark } = useTheme();
  const { hasPermission, requestNotificationPermission } = useReminders();
  const [showLoginModal, setShowLoginModal] = useState(false);

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

  const handleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      setShowLoginModal(false);
      Alert.alert('Sucesso', 'Login realizado com sucesso!');
    } else {
      Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
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
          className="w-24 h-24 rounded-3xl items-center justify-center mb-3"
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
            className="px-3 py-1 rounded-xl mt-2"
          >
            <Text style={{ color: colors.foreground }} className="text-sm font-medium">
              Modo Anônimo
            </Text>
          </View>
        )}
      </View>

      {/* Anonymous User Section */}
      {isAnonymous && (
        <View className="p-4 m-4 rounded-2xl" style={{ backgroundColor: colors.backgroundSecondary }}>
          <View className="flex-row items-center mb-2">
            <Ionicons name="lock-closed" size={20} color={colors.foreground} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.foreground }} className="text-lg font-semibold">
              Proteja seus dados
            </Text>
          </View>
          <Text style={{ color: colors.foregroundSecondary }} className="mb-3">
            Faça login para sincronizar seus dados e acessá-los de qualquer dispositivo.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary }}
            className="py-3 rounded-xl items-center"
            activeOpacity={0.8}
            onPress={() => setShowLoginModal(true)}
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

        <View
          className="p-4 rounded-xl mb-2"
          style={{ backgroundColor: colors.backgroundSecondary }}
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text style={{ color: colors.foreground }} className="text-base font-medium mb-1">
                {isDark ? 'Tema Escuro' : 'Tema Claro'}
              </Text>
              <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                {themeMode === 'system' ? 'Segue o sistema automaticamente' : 'Personalizado'}
              </Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* System Mode Option */}
        {themeMode !== 'system' && (
          <TouchableOpacity
            className="p-4 rounded-xl"
            style={{ backgroundColor: colors.backgroundSecondary }}
            onPress={() => setTheme('system')}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons name="phone-portrait" size={20} color={colors.foregroundSecondary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                Usar tema do sistema
              </Text>
            </View>
          </TouchableOpacity>
        )}
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
          className="p-4 rounded-xl mb-2"
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
                className="px-4 py-2 rounded-xl"
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
            className="p-4 rounded-xl"
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
          className="p-4 rounded-xl"
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

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View 
            className="rounded-t-3xl p-6"
            style={{ backgroundColor: colors.background }}
          >
            <Text style={{ color: colors.foreground }} className="text-2xl font-bold mb-2">
              Fazer Login
            </Text>
            <Text style={{ color: colors.foregroundSecondary }} className="mb-6">
              Entre com sua conta Google para sincronizar seus dados.
            </Text>
            
            <TouchableOpacity
              style={{ backgroundColor: colors.primary }}
              className="py-4 rounded-xl items-center mb-3"
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">Continuar com Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              onPress={() => setShowLoginModal(false)}
              activeOpacity={0.8}
            >
              <Text style={{ color: colors.foregroundSecondary }} className="font-medium">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
