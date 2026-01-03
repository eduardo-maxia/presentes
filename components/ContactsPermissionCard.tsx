import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface ContactsPermissionCardProps {
  onRequestPermission: () => void;
}

export function ContactsPermissionCard({ onRequestPermission }: ContactsPermissionCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onRequestPermission}
      style={{ 
        backgroundColor: colors.backgroundSecondary,
        borderColor: colors.primary + '40',
      }}
      className="mx-4 mb-4 p-6 rounded-2xl border-2 border-dashed"
      activeOpacity={0.7}
    >
      <View className="items-center">
        <View 
          style={{ backgroundColor: colors.primary + '20' }}
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
        >
          <Ionicons name="people" size={32} color={colors.primary} />
        </View>
        
        <Text 
          style={{ color: colors.foreground }}
          className="text-lg font-bold text-center mb-2"
        >
          Acesse seus contatos
        </Text>
        
        <Text 
          style={{ color: colors.foregroundSecondary }}
          className="text-sm text-center mb-4"
        >
          Permita o acesso aos contatos do seu celular para facilitar o gerenciamento de presentes
        </Text>
        
        <View 
          style={{ backgroundColor: colors.primary }}
          className="px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">
            Permitir acesso
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
