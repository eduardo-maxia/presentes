import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

interface ContactNotesSectionProps {
  notes: string | null;
  onSave: (notes: string) => Promise<void>;
}

export function ContactNotesSection({ notes, onSave }: ContactNotesSectionProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editedNotes.trim() || '');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as notas');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedNotes(notes || '');
    setIsEditing(false);
  };

  return (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text
          style={{ color: colors.foregroundSecondary }}
          className="text-sm font-bold tracking-wide"
        >
          NOTAS
        </Text>
        {!isEditing && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="flex-row items-center"
          >
            <Ionicons 
              name={notes ? "pencil" : "add-circle-outline"} 
              size={20} 
              color={colors.primary} 
            />
            <Text style={{ color: colors.primary }} className="ml-1 font-semibold">
              {notes ? 'Editar' : 'Adicionar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.primary 
          }}
          className="rounded-2xl border-2 overflow-hidden"
        >
          <TextInput
            style={{ 
              color: colors.foreground,
              minHeight: 120,
            }}
            className="p-4 text-base"
            placeholder="Adicione notas sobre este contato..."
            placeholderTextColor={colors.foregroundSecondary}
            value={editedNotes}
            onChangeText={setEditedNotes}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <View 
            style={{ backgroundColor: colors.background }}
            className="flex-row p-2 gap-2"
          >
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              style={{ backgroundColor: colors.primary }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isSaving}
              style={{ backgroundColor: colors.border }}
              className="flex-1 py-3 rounded-xl items-center"
            >
              <Text style={{ color: colors.foreground }} className="font-semibold">
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : notes ? (
        <View
          style={{ backgroundColor: colors.backgroundSecondary }}
          className="p-4 rounded-2xl"
        >
          <Text style={{ color: colors.foreground }} className="text-base leading-6">
            {notes}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          style={{ 
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border 
          }}
          className="p-6 rounded-2xl border-2 border-dashed items-center"
        >
          <Ionicons name="document-text-outline" size={32} color={colors.foregroundSecondary} />
          <Text style={{ color: colors.foregroundSecondary }} className="mt-2 text-sm">
            Toque para adicionar notas
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
