import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useGiftIdeas } from '@/hooks/useGiftIdeas';
import { useTheme } from '@/hooks/useTheme';
import { ContactWithEvents, GiftCategory, GiftStatus } from '@/types/database';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { contacts, loading: contactsLoading } = useContacts();
  const { giftIdeas, loading: ideasLoading, addGiftIdea } = useGiftIdeas(id);
  const { colors } = useTheme();
  
  const [contact, setContact] = useState<ContactWithEvents | null>(null);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [showNewIdeaForm, setShowNewIdeaForm] = useState(false);

  useEffect(() => {
    const foundContact = contacts.find(c => c.id === id);
    if (foundContact) {
      setContact(foundContact);
    }
  }, [id, contacts]);

  const handleAddIdea = async () => {
    if (!newIdeaTitle.trim()) {
      Alert.alert('Erro', 'Digite um título para a ideia');
      return;
    }

    const result = await addGiftIdea({
      title: newIdeaTitle,
      description: null,
      category: null,
      context: null,
      status: 'idea',
      estimated_budget: null,
      links: null,
      related_event_id: null,
    });

    if (result.success) {
      setNewIdeaTitle('');
      setShowNewIdeaForm(false);
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar a ideia');
    }
  };

  const getCategoryEmoji = (category: GiftCategory | null) => {
    const emojis = {
      practical: '🔧',
      emotional: '❤️',
      fun: '🎉',
      experience: '🎭',
    };
    return category ? emojis[category] : '💡';
  };

  const getStatusColor = (status: GiftStatus) => {
    const statusColors = {
      idea: colors.idea,
      bought: colors.bought,
      delivered: colors.delivered,
    };
    return statusColors[status];
  };

  if (contactsLoading) {
    return (
      <View
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!contact) {
    return (
      <View
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center p-4"
      >
        <Text style={{ color: colors.foreground }} className="text-lg">
          Contato não encontrado
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: colors.primary }}
          className="mt-4 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Header */}
      <View
        style={{ backgroundColor: colors.backgroundSecondary }}
        className="p-6 items-center border-b"
      >
        <View
          style={{ backgroundColor: colors.primary }}
          className="w-20 h-20 rounded-3xl items-center justify-center mb-3"
        >
          <Text className="text-white text-3xl font-bold">
            {contact.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={{ color: colors.foreground }} className="text-2xl font-bold">
          {contact.name}
        </Text>
        {contact.nickname && (
          <Text style={{ color: colors.foregroundSecondary }} className="text-base mt-1">
            "{contact.nickname}"
          </Text>
        )}
      </View>

      <ScrollView className="flex-1">
        {/* Notes Section */}
        {contact.notes && (
          <View className="p-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold mb-2"
            >
              NOTAS
            </Text>
            <View
              style={{ backgroundColor: colors.backgroundSecondary }}
              className="p-4 rounded-2xl"
            >
              <Text style={{ color: colors.foreground }}>{contact.notes}</Text>
            </View>
          </View>
        )}

        {/* Events Section */}
        {contact.events && contact.events.length > 0 && (
          <View className="p-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold mb-2"
            >
              DATAS IMPORTANTES
            </Text>
            {contact.events.map(event => (
              <View
                key={event.id}
                style={{ backgroundColor: colors.backgroundSecondary }}
                className="p-4 rounded-2xl mb-2"
              >
                <Text style={{ color: colors.foreground }} className="text-base font-semibold">
                  {event.title}
                </Text>
                <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                  {new Date(event.event_date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Gift Ideas Section */}
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold"
            >
              IDEIAS DE PRESENTE
            </Text>
            {!showNewIdeaForm && (
              <TouchableOpacity
                onPress={() => setShowNewIdeaForm(true)}
                style={{ backgroundColor: colors.primary }}
                className="px-3 py-1 rounded-lg"
              >
                <Text className="text-white text-sm font-semibold">+ Nova</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* New Idea Form */}
          {showNewIdeaForm && (
            <View
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.primary,
              }}
              className="p-4 rounded-2xl mb-2 border-2"
            >
              <TextInput
                style={{
                  color: colors.foreground,
                  borderBottomColor: colors.border,
                }}
                className="text-base pb-2 mb-3 border-b"
                placeholder="Título da ideia..."
                placeholderTextColor={colors.foregroundSecondary}
                value={newIdeaTitle}
                onChangeText={setNewIdeaTitle}
                autoFocus
              />
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleAddIdea}
                  style={{ backgroundColor: colors.primary }}
                  className="flex-1 py-2 rounded-xl items-center"
                >
                  <Text className="text-white font-semibold">Adicionar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowNewIdeaForm(false);
                    setNewIdeaTitle('');
                  }}
                  style={{ backgroundColor: colors.border }}
                  className="flex-1 py-2 rounded-xl items-center"
                >
                  <Text style={{ color: colors.foreground }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Ideas List */}
          {ideasLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : giftIdeas.length === 0 ? (
            <Text style={{ color: colors.foregroundSecondary }} className="text-center py-8">
              Nenhuma ideia ainda.
              {!showNewIdeaForm && '\nToque em "+ Nova" para adicionar!'}
            </Text>
          ) : (
            giftIdeas.map(idea => (
              <View
                key={idea.id}
                style={{ backgroundColor: colors.backgroundSecondary }}
                className="p-4 rounded-2xl mb-2"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text style={{ color: colors.foreground }} className="text-base font-semibold">
                      {getCategoryEmoji(idea.category)} {idea.title}
                    </Text>
                    {idea.description && (
                      <Text style={{ color: colors.foregroundSecondary }} className="text-sm mt-1">
                        {idea.description}
                      </Text>
                    )}
                  </View>
                  <View
                    style={{ backgroundColor: getStatusColor(idea.status) }}
                    className="px-2 py-1 rounded"
                  >
                    <Text className="text-xs font-semibold">
                      {idea.status === 'idea' && 'Ideia'}
                      {idea.status === 'bought' && 'Comprado'}
                      {idea.status === 'delivered' && 'Entregue'}
                    </Text>
                  </View>
                </View>
                {idea.estimated_budget && (
                  <Text style={{ color: colors.accent }} className="text-sm">
                    💰 R$ {idea.estimated_budget.toFixed(2)}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
