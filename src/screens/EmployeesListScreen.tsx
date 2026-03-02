import React from 'react'
import {
  SafeAreaView,
  Text,
  View,
  Pressable,
} from 'react-native'

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
}: {
  title: string
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: BRAND.red,
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

export default function EmployeesListScreen({ navigation }: any) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ padding: 16, gap: 16 }}>

        {/* HERO HEADER */}
        <View
          style={{
            backgroundColor: BRAND.black,
            borderRadius: 18,
            padding: 18,
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
            Funcionários
          </Text>

          <Text
            style={{
              color: BRAND.muted,
              fontWeight: '700',
            }}
          >
            Gestão de equipe da concessionária
          </Text>
        </View>

        {/* INFO CARD */}
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
              color: BRAND.black,
              fontWeight: '800',
            }}
          >
            Em desenvolvimento
          </Text>

          <Text
            style={{
              color: BRAND.muted,
              fontWeight: '700',
              lineHeight: 18,
            }}
          >
            A listagem de funcionários será adicionada quando o endpoint
            GET /employees estiver disponível no backend.
          </Text>
        </View>

        {/* ACTION */}
        <PrimaryButton
          title="Cadastrar novo funcionário"
          onPress={() => navigation.navigate('CreateEmployee')}
        />
      </View>
    </SafeAreaView>
  )
}