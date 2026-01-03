import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { GiftIdea, GiftAsset, GiftIdeaWithAssets } from '@/types/database';
import { useAuth } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export function useGiftIdeas(contactId?: string) {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  // Query gift ideas
  const { data: giftIdeas = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['giftIdeas', contactId],
    queryFn: async () => {
      if (!profile || !contactId) return [];

      const { data, error } = await supabase
        .from('gift_ideas')
        .select(`
          *,
          assets:gift_assets(*)
        `)
        .eq('contact_id', contactId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GiftIdeaWithAssets[];
    },
    enabled: !!profile && !!contactId,
  });

  // Mutations
  const addGiftIdeaMutation = useMutation({
    mutationFn: async (ideaData: Omit<GiftIdea, 'id' | 'profile_id' | 'contact_id' | 'created_at' | 'updated_at'>) => {
      if (!profile || !contactId) throw new Error('No profile or contact');

      const { data, error } = await supabase
        .from('gift_ideas')
        .insert({
          ...ideaData,
          contact_id: contactId,
          profile_id: profile.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftIdeas'] });
    },
  });

  const updateGiftIdeaMutation = useMutation({
    mutationFn: async ({ ideaId, updates }: { ideaId: string; updates: Partial<GiftIdea> }) => {
      const { data, error } = await supabase
        .from('gift_ideas')
        .update(updates as any)
        .eq('id', ideaId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftIdeas'] });
    },
  });

  const deleteGiftIdeaMutation = useMutation({
    mutationFn: async (ideaId: string) => {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftIdeas'] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ ideaId, imageUri }: { ideaId: string; imageUri: string }) => {
      if (!profile) throw new Error('No profile');

      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile.id}/${ideaId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gift-images')
        .upload(fileName, blob, {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gift-images')
        .getPublicUrl(fileName);

      const { data: assetData, error: assetError } = await supabase
        .from('gift_assets')
        .insert({
          gift_idea_id: ideaId,
          profile_id: profile.id,
          asset_url: publicUrl,
          asset_type: 'image',
        } as any)
        .select()
        .single();

      if (assetError) throw assetError;
      return assetData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftIdeas'] });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async ({ assetId, assetUrl }: { assetId: string; assetUrl: string }) => {
      const path = assetUrl.split('/').pop();
      if (path) {
        await supabase.storage.from('gift-images').remove([path]);
      }

      const { error } = await supabase
        .from('gift_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftIdeas'] });
    },
  });

  // Helper functions
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
    addGiftIdea: async (data: any) => {
      try {
        const result = await addGiftIdeaMutation.mutateAsync(data);
        return { success: true, data: result };
      } catch (error) {
        return { success: false, error };
      }
    },
    updateGiftIdea: async (ideaId: string, updates: Partial<GiftIdea>) => {
      try {
        await updateGiftIdeaMutation.mutateAsync({ ideaId, updates });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteGiftIdea: async (ideaId: string) => {
      try {
        await deleteGiftIdeaMutation.mutateAsync(ideaId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    uploadImage: async (ideaId: string, imageUri: string) => {
      try {
        await uploadImageMutation.mutateAsync({ ideaId, imageUri });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    deleteAsset: async (assetId: string, assetUrl: string) => {
      try {
        await deleteAssetMutation.mutateAsync({ assetId, assetUrl });
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    },
    pickImage,
    takePhoto,
    refresh: refetch,
  };
}
