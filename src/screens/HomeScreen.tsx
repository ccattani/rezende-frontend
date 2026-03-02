import React from 'react'
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
} from 'react-native'
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
  variant = 'red',
}: {
  title: string
  onPress: () => void
  variant?: 'red' | 'black'
}) {
  const bg = variant === 'red' ? BRAND.red : BRAND.black

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bg,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: BRAND.white, fontWeight: '900' }}>
        {title}
      </Text>
    </Pressable>
  )
}

export default function HomeScreen() {
  const { user, signOut } = useAuth()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ padding: 16, gap: 18 }}>

        {/* HERO */}
        <View
          style={{
            backgroundColor: BRAND.black,
            borderRadius: 20,
            padding: 20,
            gap: 6,
          }}
        >
          <Text
            style={{
              color: BRAND.white,
              fontSize: 22,
              fontWeight: '900',
            }}
          >
            Olá, {user?.name ?? 'Usuário'}
          </Text>

          <Text
            style={{
              color: BRAND.muted,
              fontWeight: '700',
            }}
          >
            Painel de gestão Rezende Veículos
          </Text>
        </View>

        {/* USER CARD */}
        <View
          style={{
            borderWidth: 1,
            borderColor: BRAND.gray,
            backgroundColor: BRAND.lightGray,
            borderRadius: 18,
            padding: 16,
            gap: 8,
          }}
        >
          <Text
            style={{
              fontWeight: '900',
              color: BRAND.black,
            }}
          >
            Perfil
          </Text>

          <Text style={{ color: BRAND.muted, fontWeight: '700' }}>
            Cargo: {user?.role ?? '-'}
          </Text>
        </View>

        {/* ACTIONS */}
        <View style={{ marginTop: 10 }}>
          <PrimaryButton
            title="Sair da conta"
            onPress={signOut}
            variant="red"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}