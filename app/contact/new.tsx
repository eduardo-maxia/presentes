import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useContacts } from '@/hooks/useContacts';
import { useTheme } from '@/hooks/useTheme';

export default function NewContactScreen() {
  const router = useRouter();
  const { addContact } = useContacts();
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    setSaving(true);
    const result = await addContact({
      name: name.trim(),
      nickname: nickname.trim() || null,
      notes: notes.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      source: 'manual',
      system_contact_id: null,
      avatar_url: null,
    });

    setSaving(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o contato');
    }
  };

  return (
    <View style={{ backgroundColor: colors.background }} className="flex-1">
      {/* Header */}
      <View
        style={{ backgroundColor: colors.backgroundSecondary }}
        className="p-4 border-b flex-row justify-between items-center"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary }} className="text-lg">
            Cancelar
          </Text>
        </TouchableOpacity>
        <Text style={{ color: colors.foreground }} className="text-lg font-bold">
          Novo Contato
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text
            style={{ color: !name.trim() ? colors.foregroundSecondary : colors.primary }}
            className="text-lg font-semibold"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Name */}
        <View className="mb-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2"
          >
            NOME *
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.backgroundSecondary,
              color: colors.foreground,
              borderColor: colors.border,
            }}
            className="p-3 rounded-lg border"
            placeholder="Nome completo"
            placeholderTextColor={colors.foregroundSecondary}
            value={name}
            onChangeText={setName}
            autoFocus
          />
        </View>

        {/* Nickname */}
        <View className="mb-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2"
          >
            APELIDO
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.backgroundSecondary,
              color: colors.foreground,
              borderColor: colors.border,
            }}
            className="p-3 rounded-lg border"
            placeholder="Como você chama essa pessoa"
            placeholderTextColor={colors.foregroundSecondary}
            value={nickname}
            onChangeText={setNickname}
          />
        </View>

        {/* Phone */}
        <View className="mb-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2"
          >
            TELEFONE
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.backgroundSecondary,
              color: colors.foreground,
              borderColor: colors.border,
            }}
            className="p-3 rounded-lg border"
            placeholder="(00) 00000-0000"
            placeholderTextColor={colors.foregroundSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2"
          >
            EMAIL
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.backgroundSecondary,
              color: colors.foreground,
              borderColor: colors.border,
            }}
            className="p-3 rounded-lg border"
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.foregroundSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Notes */}
        <View className="mb-4">
          <Text
            style={{ color: colors.foregroundSecondary }}
            className="text-sm font-semibold mb-2"
          >
            NOTAS
          </Text>
          <TextInput
            style={{
              backgroundColor: colors.backgroundSecondary,
              color: colors.foreground,
              borderColor: colors.border,
            }}
            className="p-3 rounded-lg border"
            placeholder="Anotações sobre a pessoa, gostos, etc."
            placeholderTextColor={colors.foregroundSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>
    </View>
  );
}
