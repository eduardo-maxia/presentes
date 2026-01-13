import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { GiftCategory, GiftContext, GiftStatus, GiftIdeaWithAssets } from '@/types/database';

interface GiftIdeaFormData {
  title: string;
  description: string;
  category: GiftCategory | null;
  context: GiftContext | null;
  status: GiftStatus;
  estimated_budget: string;
  links: string;
  createReminder: boolean;
  reminderDate: Date | null;
}

interface GiftIdeasSectionProps {
  contactId: string;
  contactName: string;
  ideas: GiftIdeaWithAssets[];
  loading: boolean;
  onAddIdea: (data: any, reminderData?: { date: Date; title: string }) => Promise<void>;
  onUpdateIdea?: (ideaId: string, data: any) => Promise<void>;
  onDeleteIdea?: (ideaId: string) => Promise<void>;
}

const CATEGORIES: { value: GiftCategory; label: string; emoji: string }[] = [
  { value: 'practical', label: 'Prático', emoji: '🔧' },
  { value: 'emotional', label: 'Emocional', emoji: '❤️' },
  { value: 'fun', label: 'Diversão', emoji: '🎉' },
  { value: 'experience', label: 'Experiência', emoji: '🎭' },
];

const CONTEXTS: { value: GiftContext; label: string }[] = [
  { value: 'birthday', label: 'Aniversário' },
  { value: 'christmas', label: 'Natal' },
  { value: 'anniversary', label: 'Aniversário de relação' },
  { value: 'random', label: 'Aleatório' },
  { value: 'custom', label: 'Personalizado' },
];

const STATUSES: { value: GiftStatus; label: string; color: string }[] = [
  { value: 'idea', label: 'Ideia', color: '#3B82F6' },
  { value: 'bought', label: 'Comprado', color: '#F59E0B' },
  { value: 'delivered', label: 'Entregue', color: '#10B981' },
];

export function GiftIdeasSection({ contactId, contactName, ideas, loading, onAddIdea }: GiftIdeasSectionProps) {
  const { colors } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<GiftIdeaFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: null,
      context: null,
      status: 'idea',
      estimated_budget: '',
      links: '',
      createReminder: false,
      reminderDate: null,
    },
  });

  const createReminder = watch('createReminder');

  const onSubmit = async (data: GiftIdeaFormData) => {
    try {
      const giftData = {
        title: data.title.trim(),
        description: data.description.trim() || null,
        category: data.category,
        context: data.context,
        status: data.status,
        estimated_budget: data.estimated_budget ? parseFloat(data.estimated_budget) : null,
        links: data.links.trim() ? data.links.split('\n').map(l => l.trim()).filter(Boolean) : null,
        related_event_id: null,
      };

      const reminderData = data.createReminder && data.reminderDate
        ? {
            date: data.reminderDate,
            title: `Lembrete: ${data.title.trim()}`,
          }
        : undefined;

      await onAddIdea(giftData, reminderData);
      
      reset();
      setShowForm(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar a ideia');
    }
  };

  const getCategoryEmoji = (category: GiftCategory | null) => {
    return CATEGORIES.find(c => c.value === category)?.emoji || '💡';
  };

  const getStatusColor = (status: GiftStatus) => {
    return STATUSES.find(s => s.value === status)?.color || colors.primary;
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-bold tracking-wide"
        >
          IDEIAS DE PRESENTE
        </Text>
        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="flex-row items-center"
          >
            <Ionicons name="add-circle" size={20} color={colors.primary} />
            <Text style={{ color: colors.primary }} className="ml-1 font-bold">
              Nova Ideia
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* New Idea Form */}
      {showForm && (
        <View
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.primary,
          }}
          className="rounded-2xl border-2 p-4 mb-4"
        >
          <Text style={{ color: colors.foreground }} className="text-lg font-bold mb-4">
            Nova Ideia de Presente
          </Text>

          {/* Title */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Título *
            </Text>
            <Controller
              control={control}
              name="title"
              rules={{ required: 'Título é obrigatório' }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: errors.title ? '#EF4444' : colors.border,
                  }}
                  className="p-3 rounded-xl border text-base"
                  placeholder="Ex: Livro de ficção científica"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.title && (
              <Text className="text-red-500 text-xs mt-1">{errors.title.message}</Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Descrição
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                  className="p-3 rounded-xl border text-base"
                  placeholder="Detalhes adicionais..."
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              )}
            />
          </View>

          {/* Category */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Categoria
            </Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => onChange(value === cat.value ? null : cat.value)}
                      style={{
                        backgroundColor: value === cat.value ? colors.primary : colors.background,
                        borderColor: value === cat.value ? colors.primary : colors.border,
                      }}
                      className="px-4 py-2 rounded-full border"
                    >
                      <Text
                        style={{
                          color: value === cat.value ? '#FFFFFF' : colors.foreground,
                        }}
                        className="font-semibold"
                      >
                        {cat.emoji} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Context */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Contexto
            </Text>
            <Controller
              control={control}
              name="context"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                  {CONTEXTS.map(ctx => (
                    <TouchableOpacity
                      key={ctx.value}
                      onPress={() => onChange(value === ctx.value ? null : ctx.value)}
                      style={{
                        backgroundColor: value === ctx.value ? colors.primary : colors.background,
                        borderColor: value === ctx.value ? colors.primary : colors.border,
                      }}
                      className="px-4 py-2 rounded-full border mr-2"
                    >
                      <Text
                        style={{
                          color: value === ctx.value ? '#FFFFFF' : colors.foreground,
                        }}
                        className="font-semibold"
                      >
                        {ctx.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />
          </View>

          {/* Status */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Status
            </Text>
            <Controller
              control={control}
              name="status"
              render={({ field: { onChange, value } }) => (
                <View className="flex-row gap-2">
                  {STATUSES.map(status => (
                    <TouchableOpacity
                      key={status.value}
                      onPress={() => onChange(status.value)}
                      style={{
                        backgroundColor: value === status.value ? status.color : colors.background,
                        borderColor: value === status.value ? status.color : colors.border,
                      }}
                      className="flex-1 px-3 py-2 rounded-xl border items-center"
                    >
                      <Text
                        style={{
                          color: value === status.value ? '#FFFFFF' : colors.foreground,
                        }}
                        className="font-semibold text-sm"
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>

          {/* Budget */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Orçamento Estimado (R$)
            </Text>
            <Controller
              control={control}
              name="estimated_budget"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                  className="p-3 rounded-xl border text-base"
                  placeholder="0.00"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="decimal-pad"
                />
              )}
            />
          </View>

          {/* Links */}
          <View className="mb-4">
            <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
              Links (um por linha)
            </Text>
            <Controller
              control={control}
              name="links"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: colors.background,
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                  className="p-3 rounded-xl border text-base"
                  placeholder="https://exemplo.com/produto"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              )}
            />
          </View>

          {/* Create Reminder Toggle */}
          <View className="mb-4">
            <Controller
              control={control}
              name="createReminder"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  onPress={() => onChange(!value)}
                  style={{
                    backgroundColor: value ? colors.primary + '20' : colors.background,
                    borderColor: value ? colors.primary : colors.border,
                  }}
                  className="p-4 rounded-xl border-2 flex-row items-center justify-between"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center flex-1">
                    <Ionicons 
                      name={value ? "notifications" : "notifications-outline"} 
                      size={24} 
                      color={value ? colors.primary : colors.foregroundSecondary} 
                    />
                    <View className="ml-3 flex-1">
                      <Text 
                        style={{ color: value ? colors.primary : colors.foreground }} 
                        className="font-bold text-base"
                      >
                        Criar Lembrete
                      </Text>
                      <Text 
                        style={{ color: colors.foregroundSecondary }} 
                        className="text-xs mt-1"
                      >
                        Receba uma notificação para esta ideia
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: value ? colors.primary : colors.border,
                    }}
                    className="w-12 h-6 rounded-full justify-center"
                  >
                    <View
                      style={{
                        backgroundColor: '#FFFFFF',
                        transform: [{ translateX: value ? 24 : 2 }],
                      }}
                      className="w-5 h-5 rounded-full shadow-sm"
                    />
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Reminder Date - Only show when createReminder is true */}
          {createReminder && (
            <View className="mb-4">
              <Text style={{ color: colors.foregroundSecondary }} className="text-sm font-semibold mb-2">
                Data do Lembrete *
              </Text>
              <Controller
                control={control}
                name="reminderDate"
                rules={{
                  required: createReminder ? 'Selecione uma data para o lembrete' : false,
                  validate: (value) => {
                    if (!createReminder) return true;
                    if (!value) return 'Selecione uma data';
                    if (value <= new Date()) return 'A data deve ser futura';
                    return true;
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    {/* Date Display */}
                    <TouchableOpacity
                      onPress={() => {
                        if (!value) {
                          // Set default to 7 days from now
                          const defaultDate = new Date();
                          defaultDate.setDate(defaultDate.getDate() + 7);
                          defaultDate.setHours(9, 0, 0, 0);
                          onChange(defaultDate);
                        }
                        setShowDatePicker(true);
                      }}
                      style={{
                        backgroundColor: colors.background,
                        borderColor: errors.reminderDate ? '#EF4444' : colors.border,
                      }}
                      className="p-3 rounded-xl border flex-row items-center justify-between"
                    >
                      <View className="flex-row items-center flex-1">
                        <Ionicons name="calendar" size={20} color={colors.foregroundSecondary} />
                        <Text
                          style={{ color: value ? colors.foreground : colors.foregroundSecondary }}
                          className="ml-2 text-base"
                        >
                          {value
                            ? value.toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              })
                            : 'Selecionar data'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.foregroundSecondary} />
                    </TouchableOpacity>

                    {/* Time Display */}
                    {value && (
                      <TouchableOpacity
                        onPress={() => setShowTimePicker(true)}
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                        }}
                        className="p-3 rounded-xl border flex-row items-center justify-between mt-2"
                      >
                        <View className="flex-row items-center flex-1">
                          <Ionicons name="time" size={20} color={colors.foregroundSecondary} />
                          <Text
                            style={{ color: colors.foreground }}
                            className="ml-2 text-base"
                          >
                            {value.toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.foregroundSecondary} />
                      </TouchableOpacity>
                    )}

                    {/* Date Picker Modal */}
                    {showDatePicker && (
                      <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(Platform.OS === 'ios');
                          if (selectedDate) {
                            const currentTime = value || new Date();
                            selectedDate.setHours(currentTime.getHours());
                            selectedDate.setMinutes(currentTime.getMinutes());
                            onChange(selectedDate);
                          }
                        }}
                        minimumDate={new Date()}
                      />
                    )}

                    {/* Time Picker Modal */}
                    {showTimePicker && value && (
                      <DateTimePicker
                        value={value}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedTime) => {
                          setShowTimePicker(Platform.OS === 'ios');
                          if (selectedTime) {
                            onChange(selectedTime);
                          }
                        }}
                      />
                    )}

                    {errors.reminderDate && (
                      <Text className="text-red-500 text-xs mt-1">{errors.reminderDate.message}</Text>
                    )}

                    {/* Quick Shortcuts */}
                    {value && (
                      <View className="mt-2 flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => {
                            const newDate = new Date(value);
                            newDate.setDate(newDate.getDate() + 7);
                            onChange(newDate);
                          }}
                          style={{ backgroundColor: colors.backgroundSecondary }}
                          className="px-3 py-2 rounded-lg"
                        >
                          <Text style={{ color: colors.foreground }} className="text-xs">
                            +7 dias
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const newDate = new Date(value);
                            newDate.setDate(newDate.getDate() + 14);
                            onChange(newDate);
                          }}
                          style={{ backgroundColor: colors.backgroundSecondary }}
                          className="px-3 py-2 rounded-lg"
                        >
                          <Text style={{ color: colors.foreground }} className="text-xs">
                            +14 dias
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            const newDate = new Date(value);
                            newDate.setMonth(newDate.getMonth() + 1);
                            onChange(newDate);
                          }}
                          style={{ backgroundColor: colors.backgroundSecondary }}
                          className="px-3 py-2 rounded-lg"
                        >
                          <Text style={{ color: colors.foreground }} className="text-xs">
                            +1 mês
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          )}

          {/* Actions */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              style={{ backgroundColor: colors.primary }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                {isSubmitting ? 'Salvando...' : 'Adicionar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                reset();
                setShowForm(false);
              }}
              disabled={isSubmitting}
              style={{ backgroundColor: colors.border }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text style={{ color: colors.foreground }} className="font-semibold">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Ideas List */}
      {loading ? (
        <View className="py-8 items-center">
          <Text style={{ color: colors.foregroundSecondary }}>Carregando...</Text>
        </View>
      ) : ideas.length === 0 ? (
        <TouchableOpacity
          onPress={() => setShowForm(true)}
          style={{
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          }}
          className="p-8 rounded-2xl border-2 border-dashed items-center"
        >
          <Ionicons name="gift-outline" size={48} color={colors.foregroundSecondary} />
          <Text style={{ color: colors.foregroundSecondary }} className="mt-3 text-base text-center">
            Nenhuma ideia ainda
          </Text>
          <Text style={{ color: colors.primary }} className="mt-1 font-semibold">
            Toque para adicionar
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="gap-3">
          {ideas.map(idea => (
            <TouchableOpacity
              key={idea.id}
              onPress={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
              style={{ backgroundColor: colors.backgroundSecondary }}
              className="rounded-2xl overflow-hidden"
              activeOpacity={0.7}
            >
              <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-3">
                    <Text style={{ color: colors.foreground }} className="text-lg font-bold">
                      {getCategoryEmoji(idea.category)} {idea.title}
                    </Text>
                    {idea.description && expandedIdea === idea.id && (
                      <Text style={{ color: colors.foregroundSecondary }} className="text-sm mt-2 leading-5">
                        {idea.description}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{ backgroundColor: getStatusColor(idea.status) }}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text className="text-white text-xs font-bold">
                      {STATUSES.find(s => s.value === idea.status)?.label}
                    </Text>
                  </View>
                </View>

                {expandedIdea === idea.id && (
                  <View className="mt-3 pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
                    {idea.category && (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="pricetag" size={16} color={colors.foregroundSecondary} />
                        <Text style={{ color: colors.foregroundSecondary }} className="ml-2 text-sm">
                          {CATEGORIES.find(c => c.value === idea.category)?.label}
                        </Text>
                      </View>
                    )}
                    {idea.context && (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="calendar" size={16} color={colors.foregroundSecondary} />
                        <Text style={{ color: colors.foregroundSecondary }} className="ml-2 text-sm">
                          {CONTEXTS.find(c => c.value === idea.context)?.label}
                        </Text>
                      </View>
                    )}
                    {idea.estimated_budget && (
                      <View className="flex-row items-center mb-2">
                        <Ionicons name="cash" size={16} color={colors.accent} />
                        <Text style={{ color: colors.accent }} className="ml-2 text-sm font-semibold">
                          R$ {idea.estimated_budget.toFixed(2)}
                        </Text>
                      </View>
                    )}
                    {idea.links && idea.links.length > 0 && (
                      <View className="mt-2">
                        {idea.links.map((link, index) => (
                          <View key={index} className="flex-row items-center mb-1">
                            <Ionicons name="link" size={14} color={colors.primary} />
                            <Text 
                              style={{ color: colors.primary }} 
                              className="ml-2 text-xs underline"
                              numberOfLines={1}
                            >
                              {link}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                <View className="flex-row items-center justify-end mt-2">
                  <Text style={{ color: colors.foregroundSecondary }} className="text-xs">
                    {expandedIdea === idea.id ? 'Toque para recolher' : 'Toque para ver detalhes'}
                  </Text>
                  <Ionicons 
                    name={expandedIdea === idea.id ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color={colors.foregroundSecondary}
                    style={{ marginLeft: 4 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
