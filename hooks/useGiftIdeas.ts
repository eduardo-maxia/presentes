import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GiftIdea, GiftAsset, GiftIdeaWithAssets } from '@/types/database';
import { useAuth } from './useAuth';
import * as ImagePicker from 'expo-image-picker';

export function useGiftIdeas(contactId?: string) {
  const { profile } = useAuth();
  const [giftIdeas, setGiftIdeas] = useState<GiftIdeaWithAssets[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && contactId) {
      loadGiftIdeas();
    }
  }, [profile, contactId]);

  const loadGiftIdeas = async () => {
    if (!profile || !contactId) return;

    try {
      setLoading(true);
      
      const { data: ideasData, error } = await supabase
        .from('gift_ideas')
        .select(`
          *,
          assets:gift_assets(*)
        `)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setGiftIdeas(ideasData || []);
    } catch (error) {
      console.error('Error loading gift ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const addGiftIdea = useCallback(async (
    ideaData: Omit<GiftIdea, 'id' | 'profile_id' | 'contact_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!profile || !contactId) return { success: false };

    try {
      const { data, error } = await supabase
        .from('gift_ideas')
        .insert({
          ...ideaData,
          contact_id: contactId,
          profile_id: profile.id,
        })
        .select()
        .single();

      if (error) throw error;

      await loadGiftIdeas();
      return { success: true, data };
    } catch (error) {
      console.error('Error adding gift idea:', error);
      return { success: false, error };
    }
  }, [profile, contactId]);

  const updateGiftIdea = useCallback(async (ideaId: string, updates: Partial<GiftIdea>) => {
    try {
      const { data, error } = await supabase
        .from('gift_ideas')
        .update(updates)
        .eq('id', ideaId)
        .select()
        .single();

      if (error) throw error;

      await loadGiftIdeas();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating gift idea:', error);
      return { success: false, error };
    }
  }, []);

  const deleteGiftIdea = useCallback(async (ideaId: string) => {
    try {
      // Delete associated assets from storage
      const idea = giftIdeas.find(i => i.id === ideaId);
      if (idea?.assets) {
        for (const asset of idea.assets) {
          const path = asset.asset_url.split('/').pop();
          if (path) {
            await supabase.storage.from('gift-images').remove([path]);
          }
        }
      }

      const { error } = await supabase
        .from('gift_ideas')
        .delete()
        .eq('id', ideaId);

      if (error) throw error;

      await loadGiftIdeas();
      return { success: true };
    } catch (error) {
      console.error('Error deleting gift idea:', error);
      return { success: false, error };
    }
  }, [giftIdeas]);

  const uploadImage = useCallback(async (ideaId: string, imageUri: string) => {
    if (!profile) return { success: false };

    try {
      // Get image from URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile.id}/${ideaId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gift-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gift-images')
        .getPublicUrl(fileName);

      // Save asset record
      const { data: assetData, error: assetError } = await supabase
        .from('gift_assets')
        .insert({
          gift_idea_id: ideaId,
          profile_id: profile.id,
          asset_url: publicUrl,
          asset_type: 'image',
        })
        .select()
        .single();

      if (assetError) throw assetError;

      await loadGiftIdeas();
      return { success: true, data: assetData };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { success: false, error };
    }
  }, [profile]);

  const deleteAsset = useCallback(async (assetId: string, assetUrl: string) => {
    try {
      // Delete from storage
      const path = assetUrl.split('/').pop();
      if (path) {
        await supabase.storage.from('gift-images').remove([path]);
      }

      // Delete record
      const { error } = await supabase
        .from('gift_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      await loadGiftIdeas();
      return { success: true };
    } catch (error) {
      console.error('Error deleting asset:', error);
      return { success: false, error };
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return { success: true, uri: result.assets[0].uri };
      }

      return { success: false };
    } catch (error) {
      console.error('Error picking image:', error);
      return { success: false, error };
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        return { success: false, error: 'Permission denied' };
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return { success: true, uri: result.assets[0].uri };
      }

      return { success: false };
    } catch (error) {
      console.error('Error taking photo:', error);
      return { success: false, error };
    }
  }, []);

  return {
    giftIdeas,
    loading,
    addGiftIdea,
    updateGiftIdea,
    deleteGiftIdea,
    uploadImage,
    deleteAsset,
    pickImage,
    takePhoto,
    refresh: loadGiftIdeas,
  };
}
