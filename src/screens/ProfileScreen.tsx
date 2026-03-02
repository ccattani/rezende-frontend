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

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: BRAND.muted, fontWeight: '800', fontSize: 12 }}>
        {label}
      </Text>
      <Text style={{ color: BRAND.black, fontWeight: '900', fontSize: 16 }}>
        {value ?? '-'}
      </Text>
    </View>
  )
}

export default function ProfileScreen() {
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
              fontSize: 20,
              fontWeight: '900',
            }}
          >
            Meu Perfil
          </Text>

          <Text
            style={{
              color: BRAND.muted,
              fontWeight: '800',
            }}
          >
            Informações da conta
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
            gap: 14,
          }}
        >
          <InfoRow label="Nome" value={user?.name} />
          <InfoRow label="Email" value={user?.email} />
          <InfoRow label="Cargo" value={user?.role} />
        </View>

        {/* ACTION */}
        <PrimaryButton
          title="Sair da conta"
          onPress={signOut}
          variant="red"
        />
      </View>
    </SafeAreaView>
  )
}