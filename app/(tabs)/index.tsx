import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useTheme } from '@/hooks/useTheme';
import { ContactWithEvents } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';

export default function ContactsScreen() {
  const router = useRouter();
  const { contacts, loading } = useContacts();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContextInfo = (contact: ContactWithEvents): string => {
    if (!contact.upcomingEvent) return '';
    
    const eventDate = new Date(contact.upcomingEvent.event_date);
    const today = new Date();
    const currentYear = today.getFullYear();
    eventDate.setFullYear(currentYear);
    
    if (eventDate < today) {
      eventDate.setFullYear(currentYear + 1);
    }
    
    const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) {
      return `🎉 ${contact.upcomingEvent.title} hoje!`;
    } else if (daysUntil === 1) {
      return `🎁 ${contact.upcomingEvent.title} amanhã`;
    } else if (daysUntil <= 7) {
      return `🎂 ${contact.upcomingEvent.title} em ${daysUntil} dias`;
    } else if (daysUntil <= 30) {
      return `${contact.upcomingEvent.title} em ${daysUntil} dias`;
    }
    
    return '';
  };

  const renderContact = ({ item }: { item: ContactWithEvents }) => {
    const contextInfo = getContextInfo(item);
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/contact/${item.id}`)}
        style={{ backgroundColor: colors.background }}
        className="p-4 border-b"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View
            style={{ backgroundColor: colors.primary }}
            className="w-12 h-12 rounded-full items-center justify-center mr-3"
          >
            <Text className="text-white text-xl font-bold">
              {item.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          <View className="flex-1">
            <Text
              style={{ color: colors.foreground }}
              className="text-lg font-semibold"
            >
              {item.name}
            </Text>
            {item.nickname && (
              <Text
                style={{ color: colors.foregroundSecondary }}
                className="text-sm"
              >
                "{item.nickname}"
              </Text>
            )}
            {contextInfo && (
              <Text
                style={{ color: colors.primary }}
                className="text-sm mt-1"
              >
                {contextInfo}
              </Text>
            )}
          </View>

          <Text style={{ color: colors.foregroundSecondary }}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View
        style={{ backgroundColor: colors.background }}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Search Bar */}
      <View className="p-4">
        <TextInput
          style={{
            backgroundColor: colors.backgroundSecondary,
            color: colors.foreground,
            borderColor: colors.border,
          }}
          className="p-3 rounded-lg border"
          placeholder="Buscar contatos..."
          placeholderTextColor={colors.foregroundSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View className="items-center justify-center p-8">
            <Text style={{ color: colors.foregroundSecondary }} className="text-lg text-center">
              {searchQuery
                ? 'Nenhum contato encontrado'
                : 'Nenhum contato ainda.\nToque no + para adicionar!'}
            </Text>
          </View>
        }
      />

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => router.push('/contact/new')}
        style={{ backgroundColor: colors.primary }}
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
}
