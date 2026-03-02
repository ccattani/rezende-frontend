import React, { useMemo, useState } from 'react'
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native'
import { useAuth } from '../store/auth'
import { createEmployee } from '../services/api/employees'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  muted: '#9CA3AF',
}

type RoleOption = 'COORDENADOR' | 'COLABORADOR'

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

function RoleChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? BRAND.red : BRAND.gray,
        backgroundColor: selected ? BRAND.red : BRAND.white,
      }}
    >
      <Text
        style={{
          color: selected ? BRAND.white : BRAND.black,
          fontWeight: '900',
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

export default function CreateEmployeeScreen({ navigation }: any) {
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RoleOption>('COLABORADOR')
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      !!token &&
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length > 0 &&
      !loading
    )
  }, [token, name, email, password, loading])

  async function onSubmit() {
    if (!token) {
      Alert.alert('Erro', 'Token não encontrado. Faça login novamente.')
      return
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role,
    }

    if (!payload.name || !payload.email || !payload.password) {
      Alert.alert('Erro', 'Preencha nome, email e senha.')
      return
    }

    try {
      setLoading(true)
      const res = await createEmployee(payload, token)
      Alert.alert(
        'Sucesso',
        `Usuário ${res.user.name} criado como ${res.user.role}`
      )
      navigation.goBack()
    } catch (e: any) {
      const msg = e?.response?.data?.error || 'Falha ao cadastrar usuário'
      Alert.alert('Erro', msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ padding: 16, gap: 16 }}>
        {/* HERO */}
        <View
          style={{
            backgroundColor: BRAND.black,
            borderRadius: 20,
            padding: 20,
            gap: 6,
          }}
        >
          <Text style={{ color: BRAND.white, fontSize: 20, fontWeight: '900' }}>
            Cadastrar Funcionário
          </Text>
          <Text style={{ color: BRAND.muted, fontWeight: '800' }}>
            Defina acesso e senha temporária
          </Text>
        </View>

        {/* FORM CARD */}
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
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Maria Silva"
            autoCapitalize="words"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="ex: maria@rezende.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Senha temporária"
            value={password}
            onChangeText={setPassword}
            placeholder="Defina uma senha inicial"
            secureTextEntry
            autoCapitalize="none"
          />

          <View style={{ gap: 8 }}>
            <Text style={{ color: BRAND.black, fontWeight: '900' }}>
              Permissão
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
              <RoleChip
                label="Colaborador"
                selected={role === 'COLABORADOR'}
                onPress={() => setRole('COLABORADOR')}
              />
              <RoleChip
                label="Coordenador"
                selected={role === 'COORDENADOR'}
                onPress={() => setRole('COORDENADOR')}
              />
            </View>

            <Text style={{ color: BRAND.muted, fontWeight: '700' }}>
              Selecionado: {role}
            </Text>
          </View>

          <PrimaryButton
            title={loading ? 'Salvando...' : 'Cadastrar'}
            onPress={onSubmit}
            disabled={!canSubmit}
          />

          {loading && <ActivityIndicator style={{ marginTop: 6 }} />}
        </View>
      </View>
    </SafeAreaView>
  )
}