import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Contact, ContactEvent, ContactWithEvents } from '@/types/database';
import { useAuth } from './useAuth';
import * as Contacts from 'expo-contacts';

export function useContacts() {
  const { profile } = useAuth();
  const [contacts, setContacts] = useState<ContactWithEvents[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  useEffect(() => {
    if (profile) {
      loadContacts();
    }
  }, [profile]);

  const loadContacts = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      
      // Load contacts with their events
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select(`
          *,
          events:contact_events(*)
        `)
        .eq('profile_id', profile.id)
        .order('name');

      if (contactsError) throw contactsError;

      // Process contacts to add upcoming event info
      const processedContacts = (contactsData || []).map((contact: any) => {
        const upcomingEvent = getUpcomingEvent(contact.events || []);
        return {
          ...contact,
          upcomingEvent,
        };
      });

      setContacts(processedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvent = (events: ContactEvent[]): ContactEvent | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .map(event => {
        const eventDate = new Date(event.event_date);
        const currentYear = today.getFullYear();
        eventDate.setFullYear(currentYear);

        // If event has passed this year, check next year
        if (eventDate < today) {
          eventDate.setFullYear(currentYear + 1);
        }

        return { event, daysUntil: Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)[0]?.event;
  };

  const addContact = useCallback(async (contactData: Omit<Contact, 'id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) return { success: false };

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          ...contactData,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadContacts();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding contact:', error);
      return { success: false, error };
    }
  }, [profile]);

  const updateContact = useCallback(async (contactId: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;

      await loadContacts();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error };
    }
  }, []);

  const deleteContact = useCallback(async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      await loadContacts();
      return { success: true };
    } catch (error) {
      console.error('Error deleting contact:', error);
      return { success: false, error };
    }
  }, []);

  const requestContactsPermission = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasContactsPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }, []);

  const importFromSystemContacts = useCallback(async () => {
    if (!profile) return { success: false };

    try {
      const hasPermission = hasContactsPermission || await requestContactsPermission();
      
      if (!hasPermission) {
        return { success: false, error: 'Permission denied' };
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      return { success: true, contacts: data };
    } catch (error) {
      console.error('Error importing system contacts:', error);
      return { success: false, error };
    }
  }, [profile, hasContactsPermission]);

  const addEvent = useCallback(async (contactId: string, eventData: Omit<ContactEvent, 'id' | 'contact_id' | 'profile_id' | 'created_at' | 'updated_at'>) => {
    if (!profile) return { success: false };

    try {
      const { data, error } = await supabase
        .from('contact_events')
        .insert({
          ...eventData,
          contact_id: contactId,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadContacts();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding event:', error);
      return { success: false, error };
    }
  }, [profile]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<ContactEvent>) => {
    try {
      const { data, error } = await supabase
        .from('contact_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      await loadContacts();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, error };
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('contact_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      await loadContacts();
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, error };
    }
  }, []);

  return {
    contacts,
    loading,
    hasContactsPermission,
    addContact,
    updateContact,
    deleteContact,
    requestContactsPermission,
    importFromSystemContacts,
    addEvent,
    updateEvent,
    deleteEvent,
    refresh: loadContacts,
  };
}
