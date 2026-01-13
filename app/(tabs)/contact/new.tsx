import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useContacts } from '@/hooks/useContacts';
import { useTheme } from '@/context/ThemeContext';

type FormData = {
  name: string;
  nickname: string;
  phone: string;
  email: string;
};

const formatPhone = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
  
  if (!match) return text;
  
  const [, ddd, firstPart, secondPart] = match;
  
  if (secondPart) {
    return `(${ddd}) ${firstPart}-${secondPart}`;
  } else if (firstPart) {
    return `(${ddd}) ${firstPart}`;
  } else if (ddd) {
    return `(${ddd}`;
  }
  
  return text;
};

export default function NewContactScreen() {
  const router = useRouter();
  const { addContact } = useContacts();
  const { colors } = useTheme();
  
  const nicknameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: {
      name: '',
      nickname: '',
      phone: '',
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const result = await addContact({
      name: data.name.trim(),
      nickname: data.nickname.trim() || null,
      notes: null,
      phone: data.phone.trim() || null,
      email: data.email.trim() || null,
      source: 'manual',
      system_contact_id: null,
      avatar_url: null,
    });

    if (result.success) {
      router.back();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o contato');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
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
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text
              style={{ color: isSubmitting ? colors.foregroundSecondary : colors.primary }}
              className="text-lg font-semibold"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4" keyboardShouldPersistTaps="handled">
          {/* Name */}
          <View className="mb-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold mb-2"
            >
              NOME *
            </Text>
            <Controller
              control={control}
              name="name"
              rules={{ 
                required: 'O nome é obrigatório',
                minLength: { value: 2, message: 'Nome deve ter no mínimo 2 caracteres' }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.foreground,
                    borderColor: errors.name ? '#ef4444' : colors.border,
                  }}
                  className="p-3 rounded-xl border"
                  placeholder="Nome completo"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => nicknameRef.current?.focus()}
                />
              )}
            />
            {errors.name && (
              <Text style={{ color: '#ef4444' }} className="text-sm mt-1">
                {errors.name.message}
              </Text>
            )}
          </View>

          {/* Nickname */}
          <View className="mb-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold mb-2"
            >
              APELIDO
            </Text>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={nicknameRef}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                  className="p-3 rounded-xl border"
                  placeholder="Como você chama essa pessoa"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                />
              )}
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
            <Controller
              control={control}
              name="phone"
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  const cleaned = value.replace(/\D/g, '');
                  return cleaned.length === 11 || 'Telefone inválido';
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={phoneRef}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.foreground,
                    borderColor: errors.phone ? '#ef4444' : colors.border,
                  }}
                  className="p-3 rounded-xl border"
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={(text) => {
                    const formatted = formatPhone(text);
                    onChange(formatted);
                  }}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  maxLength={15}
                />
              )}
            />
            {errors.phone && (
              <Text style={{ color: '#ef4444' }} className="text-sm mt-1">
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text
              style={{ color: colors.foregroundSecondary }}
              className="text-sm font-semibold mb-2"
            >
              EMAIL
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email inválido'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  ref={emailRef}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.foreground,
                    borderColor: errors.email ? '#ef4444' : colors.border,
                  }}
                  className="p-3 rounded-xl border"
                  placeholder="email@exemplo.com"
                  placeholderTextColor={colors.foregroundSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
            {errors.email && (
              <Text style={{ color: '#ef4444' }} className="text-sm mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
