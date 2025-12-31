import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Reminder } from '@/types/database';
import { useAuth } from './useAuth';
import { NotificationService } from '@/services/notifications';

export function useReminders() {
  const { profile } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (profile) {
      loadReminders();
      checkNotificationPermission();
    }
  }, [profile]);

  const checkNotificationPermission = async () => {
    const hasPerms = await NotificationService.requestPermissions();
    setHasPermission(hasPerms);
  };

  const loadReminders = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('profile_id', profile.id)
        .order('remind_at');

      if (error) throw error;

      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = useCallback(async (
    reminderData: Omit<Reminder, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'is_sent' | 'notification_id'>,
    contactName?: string
  ) => {
    if (!profile) return { success: false };

    try {
      // Schedule notification first
      const notificationId = await NotificationService.scheduleCustomReminder(
        { ...reminderData, profile_id: profile.id },
        contactName
      );

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          profile_id: profile.id,
          notification_id: notificationId,
        })
        .select()
        .single();

      if (error) throw error;

      await loadReminders();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding reminder:', error);
      return { success: false, error };
    }
  }, [profile]);

  const updateReminder = useCallback(async (reminderId: string, updates: Partial<Reminder>) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      
      // Cancel old notification if exists
      if (reminder?.notification_id) {
        await NotificationService.cancelNotification(reminder.notification_id);
      }

      // Schedule new notification if date changed
      let notificationId = reminder?.notification_id;
      if (updates.remind_at) {
        notificationId = await NotificationService.scheduleCustomReminder({
          ...reminder,
          ...updates,
          profile_id: profile!.id,
        } as any);
      }

      const { data, error } = await supabase
        .from('reminders')
        .update({
          ...updates,
          notification_id: notificationId,
        })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;

      await loadReminders();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating reminder:', error);
      return { success: false, error };
    }
  }, [reminders, profile]);

  const deleteReminder = useCallback(async (reminderId: string) => {
    try {
      const reminder = reminders.find(r => r.id === reminderId);
      
      // Cancel notification
      if (reminder?.notification_id) {
        await NotificationService.cancelNotification(reminder.notification_id);
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;

      await loadReminders();
      return { success: true };
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return { success: false, error };
    }
  }, [reminders]);

  const requestNotificationPermission = useCallback(async () => {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  const getUpcomingReminders = useCallback((days: number = 7) => {
    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    return reminders.filter(reminder => {
      const remindAt = new Date(reminder.remind_at);
      return remindAt >= now && remindAt <= future && !reminder.is_sent;
    });
  }, [reminders]);

  return {
    reminders,
    loading,
    hasPermission,
    addReminder,
    updateReminder,
    deleteReminder,
    requestNotificationPermission,
    getUpcomingReminders,
    refresh: loadReminders,
  };
}
