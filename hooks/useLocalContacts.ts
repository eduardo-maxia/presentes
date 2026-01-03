import { useState, useEffect, useCallback } from 'react';
import * as Contacts from 'expo-contacts';

export interface LocalContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export function useLocalContacts() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [contacts, setContacts] = useState<LocalContact[]>([]);
  const [loading, setLoading] = useState(false);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        loadContacts();
      }
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      setHasPermission(false);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
      });

      if (data) {
        const formattedContacts: LocalContact[] = data
          .filter(c => c.name) // Only contacts with names
          .map((c, index) => ({
            id: (c as any).id || `local-${index}`,
            name: c.name,
            phone: c.phoneNumbers?.[0]?.number || null,
            email: c.emails?.[0]?.email || null,
          }));

        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading system contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (granted) {
        await loadContacts();
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }, []);

  return {
    contacts,
    loading,
    hasPermission,
    requestPermission,
    refresh: loadContacts,
  };
}
