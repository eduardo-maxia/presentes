import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useContacts } from '@/hooks/useContacts';
import { useReminders } from '@/hooks/useReminders';
import { useTheme } from '@/context/ThemeContext';
import { ContactEvent } from '@/types/database';

export default function AgendaScreen() {
  const router = useRouter();
  const { contacts, loading: contactsLoading } = useContacts();
  const { reminders, loading: remindersLoading } = useReminders();
  const { colors } = useTheme();

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allEvents: Array<{ event: ContactEvent; contact: any; daysUntil: number }> = [];

    contacts.forEach(contact => {
      if (contact.events) {
        contact.events.forEach(event => {
          const eventDate = new Date(event.event_date);
          const currentYear = today.getFullYear();
          eventDate.setFullYear(currentYear);

          if (eventDate < today) {
            eventDate.setFullYear(currentYear + 1);
          }

          const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 30) {
            allEvents.push({ event, contact, daysUntil });
          }
        });
      }
    });

    return allEvents.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 30);

    return reminders
      .filter(reminder => {
        const remindAt = new Date(reminder.remind_at);
        return remindAt >= now && remindAt <= future && !reminder.is_sent;
      })
      .sort((a, b) => new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime());
  };

  const upcomingEvents = getUpcomingEvents();
  const upcomingReminders = getUpcomingReminders();
  const todayEvents = upcomingEvents.filter(e => e.daysUntil === 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const getDaysText = (days: number) => {
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    return `Em ${days} dias`;
  };

  if (contactsLoading || remindersLoading) {
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
    <ScrollView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      {/* Today Section */}
      {todayEvents.length > 0 && (
        <View className="p-4">
          <Text
            style={{ color: colors.foreground }}
            className="text-2xl font-bold mb-3"
          >
            🎉 Hoje
          </Text>
          {todayEvents.map(({ event, contact }) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/contact/${contact.id}`)}
              style={{ backgroundColor: colors.backgroundSecondary }}
              className="p-4 rounded-2xl mb-2"
              activeOpacity={0.7}
            >
              <Text style={{ color: colors.primary }} className="text-lg font-semibold">
                {event.title}
              </Text>
              <Text style={{ color: colors.foreground }} className="text-base">
                {contact.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Upcoming Events */}
      <View className="p-4">
        <Text
          style={{ color: colors.foreground }}
          className="text-xl font-bold mb-3"
        >
          📆 Próximos Eventos
        </Text>
        {upcomingEvents.length === 0 ? (
          <Text style={{ color: colors.foregroundSecondary }} className="text-center py-8">
            Nenhum evento próximo
          </Text>
        ) : (
          upcomingEvents.map(({ event, contact, daysUntil }) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => router.push(`/contact/${contact.id}`)}
              style={{
                backgroundColor: colors.backgroundSecondary,
                borderLeftColor: daysUntil <= 7 ? colors.primary : colors.secondary,
              }}
              className="p-4 rounded-2xl mb-2 border-l-4"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text style={{ color: colors.foreground }} className="text-lg font-semibold">
                    {contact.name}
                  </Text>
                  <Text style={{ color: colors.foregroundSecondary }} className="text-sm">
                    {event.title}
                  </Text>
                </View>
                <Text
                  style={{
                    color: daysUntil <= 7 ? colors.primary : colors.foregroundSecondary
                  }}
                  className="text-sm font-medium"
                >
                  {getDaysText(daysUntil)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <View className="p-4">
          <Text
            style={{ color: colors.foreground }}
            className="text-xl font-bold mb-3"
          >
            🔔 Lembretes
          </Text>
          {upcomingReminders.map(reminder => (
            <View
              key={reminder.id}
              style={{ backgroundColor: colors.backgroundSecondary }}
              className="p-4 rounded-2xl mb-2"
            >
              <Text style={{ color: colors.foreground }} className="text-base font-semibold">
                {reminder.title}
              </Text>
              {reminder.message && (
                <Text style={{ color: colors.foregroundSecondary }} className="text-sm mt-1">
                  {reminder.message}
                </Text>
              )}
              <Text style={{ color: colors.accent }} className="text-sm mt-2">
                {formatDate(reminder.remind_at)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {upcomingEvents.length === 0 && upcomingReminders.length === 0 && (
        <View className="items-center justify-center p-8 mt-8">
          <Text className="text-6xl mb-4">📅</Text>
          <Text
            style={{ color: colors.foreground }}
            className="text-xl font-semibold text-center"
          >
            Nada por aqui ainda!
          </Text>
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-base text-center mt-2"
          >
            Adicione eventos e lembretes aos seus contatos
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
