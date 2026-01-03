import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Contact, ContactEvent, ContactWithEvents } from '@/types/database';
import { useAuth } from '@/context/AuthContext';

export function useContacts() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const getUpcomingEvent = (events: ContactEvent[]): ContactEvent | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .map(event => {
        const eventDate = new Date(event.event_date);
        const currentYear = today.getFullYear();
        eventDate.setFullYear(currentYear);

        if (eventDate < today) {
          eventDate.setFullYear(currentYear + 1);
        }

        return { event, daysUntil: Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)[0]?.event;
  };

  // Query contacts from DB only
  const { data: contacts = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['contacts', profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data: contactsData, error } = await supabase
        .from('contacts')
        .select(`
          *,
          events:contact_events(*)
        `)
        .eq('profile_id', profile.id)
        .order('name');

      if (error) throw error;

      return (contactsData || []).map((contact: any) => ({
        ...contact,
        upcomingEvent: getUpcomingEvent(contact.events || []),
      })) as ContactWithEvents[];
    },
    enabled: !!profile,
  });

  // Mutations
  const addContactMutation = useMutation({
    mutationFn: async (contactData: Omit<Contact, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
      if (!profile) throw new Error('No profile');

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          profile_id: profile.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string; updates: Partial<Contact> }) => {
      const { data, error } = await supabase
        .from('contacts')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const addEventMutation = useMutation({
    mutationFn: async ({ contactId, eventData }: { contactId: string; eventData: Omit<ContactEvent, 'id' | 'contact_id' | 'profile_id' | 'created_at' | 'updated_at'> }) => {
      if (!profile) throw new Error('No profile');

      const { data, error } = await supabase
        .from('contact_events')
        .insert({
          ...eventData,
          contact_id: contactId,
          profile_id: profile.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string; updates: Partial<ContactEvent> }) => {
      const { data, error } = await supabase
        .from('contact_events')
        // @ts-ignore - Supabase type inference issue
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('contact_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });

  return {
    contacts,
    loading,
    addContact: async (data: any) => {
      try {
        const result = await addContactMutation.mutateAsync(data);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
    updateContact: async (contactId: string, updates: Partial<Contact>) => {
      try {
        await updateContactMutation.mutateAsync({ contactId, updates });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteContact: async (contactId: string) => {
      try {
        await deleteContactMutation.mutateAsync(contactId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    addEvent: async (contactId: string, eventData: any) => {
      try {
        await addEventMutation.mutateAsync({ contactId, eventData });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    updateEvent: async (eventId: string, updates: Partial<ContactEvent>) => {
      try {
        await updateEventMutation.mutateAsync({ eventId, updates });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteEvent: async (eventId: string) => {
      try {
        await deleteEventMutation.mutateAsync(eventId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    refresh: refetch,
  };
}
