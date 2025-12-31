import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ContactEvent, Reminder } from '@/types/database';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    return true;
  }

  static async scheduleBirthdayReminder(
    event: ContactEvent,
    contactName: string,
    daysBeforeArray: number[] = [7, 3, 1, 0]
  ): Promise<string[]> {
    const notificationIds: string[] = [];
    const eventDate = new Date(event.event_date);
    const currentYear = new Date().getFullYear();
    
    // Set to current year for recurring events
    eventDate.setFullYear(currentYear);
    
    // If the date has passed this year, schedule for next year
    if (eventDate < new Date()) {
      eventDate.setFullYear(currentYear + 1);
    }

    for (const daysBefore of daysBeforeArray) {
      const notificationDate = new Date(eventDate);
      notificationDate.setDate(notificationDate.getDate() - daysBefore);
      notificationDate.setHours(9, 0, 0, 0); // 9 AM

      // Only schedule if in the future
      if (notificationDate > new Date()) {
        const message = this.getBirthdayMessage(contactName, daysBefore);
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: daysBefore === 0 ? '🎂 Aniversário hoje!' : '🎁 Lembrete de aniversário',
            body: message,
            data: { eventId: event.id, contactName, daysBefore },
            sound: true,
          },
          trigger: {
            date: notificationDate,
          } as any,
        });

        notificationIds.push(notificationId);
      }
    }

    return notificationIds;
  }

  static async scheduleCustomReminder(
    reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at' | 'is_sent'>,
    contactName?: string
  ): Promise<string> {
    const remindAt = new Date(reminder.remind_at);
    
    if (remindAt <= new Date()) {
      throw new Error('Reminder date must be in the future');
    }

    const title = reminder.title || '🔔 Lembrete';
    const body = reminder.message || (contactName ? `Não esqueça de ${contactName}!` : 'Você tem um lembrete!');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          contactId: reminder.contact_id,
          eventId: reminder.event_id,
          giftIdeaId: reminder.gift_idea_id,
        },
        sound: true,
      },
      trigger: {
        date: remindAt,
      } as any,
    });

    return notificationId;
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  static async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  static async getAllScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  private static getBirthdayMessage(name: string, daysBefore: number): string {
    const messages = {
      7: `O aniversário de ${name} está chegando em uma semana! 🎂`,
      3: `Faltam só 3 dias para o aniversário de ${name}! 🎉`,
      1: `Amanhã é o aniversário de ${name}! Já escolheu o presente? 🎁`,
      0: `Hoje é o aniversário de ${name}! Parabéns! 🎊`,
    };

    return messages[daysBefore as keyof typeof messages] || 
           `O aniversário de ${name} está chegando em ${daysBefore} dias!`;
  }

  static getEventReminderMessage(eventTitle: string, contactName: string, daysBefore: number): string {
    if (daysBefore === 0) {
      return `Hoje é ${eventTitle} de ${contactName}! 🎉`;
    } else if (daysBefore === 1) {
      return `Amanhã é ${eventTitle} de ${contactName}! 🎁`;
    } else {
      return `${eventTitle} de ${contactName} está chegando em ${daysBefore} dias!`;
    }
  }
}
