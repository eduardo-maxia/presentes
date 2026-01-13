import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useLocalContacts } from '@/hooks/useLocalContacts';
import { useTheme } from '@/context/ThemeContext';
import { ContactWithEvents } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { ContactsPermissionCard } from '@/components/ContactsPermissionCard';

interface DisplayContact extends ContactWithEvents {
  isLocal?: boolean; // true if it's from system and not yet saved in DB
  localContactData?: {
    name: string;
    phone: string | null;
    email: string | null;
  };
}

export default function ContactsScreen() {
  const router = useRouter();
  const { contacts: dbContacts, loading: dbLoading, addContact } = useContacts();
  const { contacts: localContacts, hasPermission, requestPermission, loading: localLoading } = useLocalContacts();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Merge contacts: DB contacts + local contacts not in DB (by phone number)
  const mergedContacts = useMemo(() => {
    const merged: DisplayContact[] = [...dbContacts];

    if (hasPermission) {
      // Create a set of phone numbers already in DB
      const dbPhones = new Set(
        dbContacts
          .map(c => c.phone)
          .filter(Boolean)
          .map(p => p!.replace(/\D/g, '')) // Remove non-digits for comparison
      );

      // Add local contacts that don't have matching phone in DB
      localContacts.forEach(local => {
        if (local.phone) {
          const normalizedPhone = local.phone.replace(/\D/g, '');
          if (!dbPhones.has(normalizedPhone)) {
            merged.push({
              id: local.id,
              name: local.name,
              nickname: null,
              notes: null,
              phone: local.phone,
              email: local.email,
              source: 'system',
              system_contact_id: local.id,
              profile_id: '',
              avatar_url: null,
              created_at: '',
              updated_at: '',
              upcomingEvent: undefined,
              isLocal: true,
              localContactData: {
                name: local.name,
                phone: local.phone,
                email: local.email,
              },
            } as DisplayContact);
          }
        } else {
          // Contact without phone - add only if name doesn't match
          const nameExists = dbContacts.some(
            db => db.name.toLowerCase() === local.name.toLowerCase()
          );
          
          if (!nameExists) {
            merged.push({
              id: local.id,
              name: local.name,
              nickname: null,
              notes: null,
              phone: null,
              email: local.email,
              source: 'system',
              system_contact_id: local.id,
              profile_id: '',
              avatar_url: null,
              created_at: '',
              updated_at: '',
              upcomingEvent: undefined,
              isLocal: true,
              localContactData: {
                name: local.name,
                phone: null,
                email: local.email,
              },
            } as DisplayContact);
          }
        }
      });
    }

    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }, [dbContacts, localContacts, hasPermission]);

  const loading = dbLoading || localLoading;

  const filteredContacts = mergedContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.nickname?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getContextInfo = (contact: DisplayContact): string => {
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

  const renderContact = ({ item }: { item: DisplayContact }) => {
    const contextInfo = getContextInfo(item);
    
    const handlePress = async () => {
      // If it's a local contact, save it to DB first
      if (item.isLocal && item.localContactData) {
        const result = await addContact({
          name: item.localContactData.name,
          nickname: null,
          notes: null,
          phone: item.localContactData.phone,
          email: item.localContactData.email,
          source: 'system',
          system_contact_id: item.id,
          avatar_url: null,
        });

        if (result.success) {
          // Navigate to the newly created contact
          router.push(`/contact/${(result as any).data.id}`);
        }
      } else {
        // Already in DB, just navigate
        router.push(`/contact/${item.id}`);
      }
    };
    
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={{ backgroundColor: colors.background }}
        className="p-4 border-b"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View
            style={{ backgroundColor: colors.primary }}
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
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
          className="p-3 rounded-xl border"
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
        ListHeaderComponent={
          hasPermission === false && !searchQuery ? (
            <ContactsPermissionCard onRequestPermission={requestPermission} />
          ) : null
        }
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
        className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
