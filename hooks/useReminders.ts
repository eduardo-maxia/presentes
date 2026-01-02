import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Reminder } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import { NotificationService } from '@/services/notifications';

export function useReminders() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const hasPerms = await NotificationService.requestPermissions();
    setHasPermission(hasPerms);
  };

  // Query reminders
  const { data: reminders = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['reminders', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('profile_id', profile.id)
        .order('remind_at');

      if (error) throw error;
      return data as Reminder[];
    },
    enabled: !!profile,
  });

  // Mutations
  const addReminderMutation = useMutation({
    mutationFn: async ({ reminderData, contactName }: { reminderData: Omit<Reminder, 'id' | 'profile_id' | 'created_at' | 'updated_at' | 'is_sent' | 'notification_id'>; contactName?: string }) => {
      if (!profile) throw new Error('No profile');

      const notificationId = await NotificationService.scheduleCustomReminder(
        { ...reminderData, profile_id: profile.id, notification_id: null },
        contactName
      );

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminderData,
          profile_id: profile.id,
          notification_id: notificationId,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ reminderId, updates }: { reminderId: string; updates: Partial<Reminder> }) => {
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (reminder?.notification_id) {
        await NotificationService.cancelNotification(reminder.notification_id);
      }

      let notificationId = reminder?.notification_id;
      if (updates.remind_at && profile) {
        notificationId = await NotificationService.scheduleCustomReminder({
          ...reminder,
          ...updates,
          profile_id: profile.id,
        } as any);
      }

      const { data, error } = await supabase
        .from('reminders')
        .update({
          ...updates,
          notification_id: notificationId,
        } as any)
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (reminder?.notification_id) {
        await NotificationService.cancelNotification(reminder.notification_id);
      }

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

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
    addReminder: async (data: any, contactName?: string) => {
      try {
        await addReminderMutation.mutateAsync({ reminderData: data, contactName });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    updateReminder: async (reminderId: string, updates: Partial<Reminder>) => {
      try {
        await updateReminderMutation.mutateAsync({ reminderId, updates });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteReminder: async (reminderId: string) => {
      try {
        await deleteReminderMutation.mutateAsync(reminderId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    requestNotificationPermission,
    getUpcomingReminders,
    refresh: refetch,
  };
}
