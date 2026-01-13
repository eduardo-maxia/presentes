import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface DummyReminder {
  id: string;
  title: string;
  date: string;
  enabled: boolean;
}

interface RemindersSectionProps {
  contactName: string;
}

export function RemindersSection({ contactName }: RemindersSectionProps) {
  const { colors } = useTheme();
  
  // Dummy reminders - will be replaced with real data later
  const [reminders, setReminders] = useState<DummyReminder[]>([
    {
      id: '1',
      title: `Aniversário de ${contactName}`,
      date: '2026-06-15',
      enabled: true,
    },
    {
      id: '2',
      title: 'Comprar presente de Natal',
      date: '2026-12-20',
      enabled: false,
    },
  ]);

  const [showSuggestions, setShowSuggestions] = useState(false);

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric' 
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Passou';
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays <= 7) return `Em ${diffDays} dias`;
    return formatDate(dateString);
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-bold tracking-wide"
        >
          LEMBRETES
        </Text>
        <TouchableOpacity
          onPress={() => setShowSuggestions(!showSuggestions)}
          className="flex-row items-center"
        >
          <Ionicons name="notifications" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary }} className="ml-1 font-bold">
            {showSuggestions ? 'Ocultar' : 'Gerenciar'}
          </Text>
        </TouchableOpacity>
      </View>

      {reminders.length === 0 ? (
        <TouchableOpacity
          onPress={() => setShowSuggestions(true)}
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }}
          className="p-6 rounded-2xl border-2 border-dashed items-center"
        >
          <Ionicons name="alarm-outline" size={40} color={colors.foregroundSecondary} />
          <Text style={{ color: colors.foregroundSecondary }} className="mt-2 text-sm">
            Nenhum lembrete configurado
          </Text>
          <Text style={{ color: colors.primary }} className="mt-1 font-semibold text-xs">
            Toque para adicionar
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="gap-2">
          {reminders.map(reminder => (
            <View
              key={reminder.id}
              style={{ 
                backgroundColor: colors.backgroundSecondary,
                borderLeftColor: reminder.enabled ? colors.primary : colors.border,
              }}
              className="rounded-xl border-l-4 overflow-hidden"
            >
              <View className="p-4 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <Text 
                    style={{ 
                      color: reminder.enabled ? colors.foreground : colors.foregroundSecondary 
                    }} 
                    className="text-base font-semibold mb-1"
                  >
                    {reminder.title}
                  </Text>
                  <View className="flex-row items-center">
                    <Ionicons 
                      name="time-outline" 
                      size={14} 
                      color={reminder.enabled ? colors.accent : colors.foregroundSecondary} 
                    />
                    <Text 
                      style={{ 
                        color: reminder.enabled ? colors.accent : colors.foregroundSecondary 
                      }} 
                      className="ml-1 text-xs font-semibold"
                    >
                      {getDaysUntil(reminder.date)}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => toggleReminder(reminder.id)}
                  style={{ 
                    backgroundColor: reminder.enabled ? colors.primary : colors.border 
                  }}
                  className="w-12 h-6 rounded-full justify-center"
                  activeOpacity={0.7}
                >
                  <View 
                    style={{
                      backgroundColor: '#FFFFFF',
                      transform: [{ translateX: reminder.enabled ? 24 : 2 }],
                    }}
                    className="w-5 h-5 rounded-full shadow-sm"
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Suggestions Section (Expandable) */}
      {showSuggestions && (
        <View
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.primary,
          }}
          className="mt-4 p-4 rounded-2xl border-2"
        >
          <View className="flex-row items-center mb-3">
            <Ionicons name="bulb" size={20} color={colors.accent} />
            <Text style={{ color: colors.foreground }} className="ml-2 font-bold text-base">
              Sugestões de Lembretes
            </Text>
          </View>

          <ScrollView className="gap-2" style={{ maxHeight: 300 }}>
            {/* Dummy suggestions */}
            {[
              { title: '1 semana antes do aniversário', days: 7 },
              { title: '1 mês antes do Natal', days: 30 },
              { title: '2 semanas antes do evento', days: 14 },
              { title: '3 dias antes da data', days: 3 },
            ].map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
                className="p-3 rounded-xl border flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.foreground }} className="font-semibold">
                    {suggestion.title}
                  </Text>
                  <Text style={{ color: colors.foregroundSecondary }} className="text-xs mt-1">
                    {suggestion.days} dias de antecedência
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={{ backgroundColor: colors.primary }}
            className="mt-4 py-3 rounded-xl items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold">
              Criar Lembrete Personalizado
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Info Banner */}
      <View
        style={{ backgroundColor: colors.backgroundSecondary }}
        className="mt-3 p-3 rounded-xl flex-row items-start"
      >
        <Ionicons name="information-circle" size={20} color={colors.accent} />
        <Text style={{ color: colors.foregroundSecondary }} className="ml-2 text-xs flex-1">
          Os lembretes ajudam você a não esquecer datas importantes e prazos para comprar presentes
        </Text>
      </View>
    </View>
  );
}
