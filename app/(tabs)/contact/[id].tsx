import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useGiftIdeas } from '@/hooks/useGiftIdeas';
import { useReminders } from '@/hooks/useReminders';
import { useTheme } from '@/context/ThemeContext';
import { ContactWithEvents } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { ContactNotesSection } from '@/components/contact/ContactNotesSection';
import { GiftIdeasSection } from '@/components/contact/GiftIdeasSection';
import { RemindersSection } from '@/components/contact/RemindersSection';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { contacts, loading: contactsLoading, updateContact } = useContacts();
  const { giftIdeas, loading: ideasLoading, addGiftIdea } = useGiftIdeas(id);
  const { addReminder } = useReminders();
  const { colors } = useTheme();
  
  const [contact, setContact] = useState<ContactWithEvents | null>(null);

  useEffect(() => {
    const foundContact = contacts.find(c => c.id === id);
    if (foundContact) {
      setContact(foundContact);
    }
  }, [id, contacts]);

  const handleUpdateNotes = async (notes: string) => {
    if (!contact) return;
    await updateContact(contact.id, { notes: notes || null });
  };

  const handleAddGiftIdea = async (
    data: any, 
    reminderData?: { date: Date; title: string }
  ) => {
    const result = await addGiftIdea(data);
    if (!result.success) {
      throw new Error('Failed to add gift idea');
    }

    // Create reminder if requested
    if (reminderData && result.success && 'data' in result && result.data) {
      try {
        await addReminder({
          reminderData: {
            contact_id: contact?.id || null,
            event_id: null,
            gift_idea_id: (result as any).data.id,
            title: reminderData.title,
            message: `Lembrete para: ${data.title}`,
            remind_at: reminderData.date.toISOString(),
            is_sent: false,
          },
          contactName: contact?.name,
        });
      } catch (error) {
        console.error('Failed to create reminder:', error);
        // Don't throw - gift idea was created successfully
      }
    }
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
        
        {/* Contact Info */}
        <View className="mt-4 flex-row gap-4">
          {contact.phone && (
            <View className="flex-row items-center">
              <Ionicons name="call" size={16} color={colors.foregroundSecondary} />
              <Text style={{ color: colors.foregroundSecondary }} className="ml-1 text-sm">
                {contact.phone}
              </Text>
            </View>
          )}
          {contact.email && (
            <View className="flex-row items-center">
              <Ionicons name="mail" size={16} color={colors.foregroundSecondary} />
              <Text style={{ color: colors.foregroundSecondary }} className="ml-1 text-sm">
                {contact.email}
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Notes Section */}
        <ContactNotesSection 
          notes={contact.notes} 
          onSave={handleUpdateNotes}
        />

        {/* Events Section */}
        {contact.events && contact.events.length > 0 && (
          <View className="px-4 pb-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-bold tracking-wide mb-3"
            >
              DATAS IMPORTANTES
            </Text>
            {contact.events.map(event => (
              <View
                key={event.id}
                style={{ backgroundColor: colors.backgroundSecondary }}
                className="p-4 rounded-2xl mb-2 flex-row items-center"
              >
                <View
                  style={{ backgroundColor: colors.primary + '20' }}
                  className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                >
                  <Ionicons name="calendar" size={24} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.foreground }} className="text-base font-bold">
                    {event.title}
                  </Text>
                  <Text style={{ color: colors.foregroundSecondary }} className="text-sm mt-1">
                    {new Date(event.event_date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                    })}
                  </Text>
                </View>
                {event.recurring && (
                  <Ionicons name="repeat" size={20} color={colors.accent} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Reminders Section */}
        <RemindersSection contactName={contact.name} />

        {/* Gift Ideas Section */}
        <GiftIdeasSection
          contactId={contact.id}
          contactName={contact.name}
          ideas={giftIdeas}
          loading={ideasLoading}
          onAddIdea={handleAddGiftIdea}
        />

        {/* Bottom Padding */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
