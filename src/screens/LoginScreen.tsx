import React, { useMemo, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native'
import { login } from '../services/api/auth'
import { useAuth } from '../store/auth'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  muted: '#9CA3AF',
}

function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string
  onPress: () => void
  disabled?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? BRAND.muted : BRAND.red,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: BRAND.white, fontWeight: '900' }}>{title}</Text>
    </Pressable>
  )
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: BRAND.black, fontWeight: '900' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.muted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: BRAND.gray,
          backgroundColor: BRAND.lightGray,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: BRAND.black,
          fontWeight: '800',
        }}
      />
    </View>
  )
}

export default function LoginScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0 && !loading
  }, [email, password, loading])

  async function onSubmit() {
    if (!canSubmit) return

    try {
      setLoading(true)
      const data = await login(email.trim().toLowerCase(), password)
      await signIn(data)
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Falha no login'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>

        {/* LOGO */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{
              width: 180,
              height: 180,
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* HERO */}
        <View
          style={{
            backgroundColor: BRAND.black,
            borderRadius: 20,
            padding: 20,
            gap: 6,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: BRAND.white, fontSize: 22, fontWeight: '900' }}>
            Rezende Veículos
          </Text>
          <Text style={{ color: BRAND.muted, fontWeight: '800' }}>
            Acesse sua conta para gerenciar o estoque
          </Text>
        </View>

        {/* FORM */}
        <View
          style={{
            borderWidth: 1,
            borderColor: BRAND.gray,
            backgroundColor: BRAND.white,
            borderRadius: 18,
            padding: 16,
            gap: 14,
          }}
        >
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@dominio.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Sua senha"
            secureTextEntry
            autoCapitalize="none"
          />

          <PrimaryButton
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={onSubmit}
            disabled={!canSubmit}
          />

          {loading && <ActivityIndicator style={{ marginTop: 6 }} />}
        </View>
      </View>
    </SafeAreaView>
  )
}