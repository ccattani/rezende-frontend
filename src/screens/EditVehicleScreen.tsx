import React, { useMemo, useState } from 'react'
import {
  SafeAreaView,
  TextInput,
  View,
  Alert,
  Text,
  ActivityIndicator,
  Pressable,
} from 'react-native'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateVehicle } from '../services/api/vehicles'
import type { VehiclesStackParamList } from '../app/RootNavigator'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  muted: '#9CA3AF',
}

type NavigationProp = NativeStackNavigationProp<
  VehiclesStackParamList,
  'EditVehicle'
>

function parseBRLToNumber(input: string): number {
  // Aceita "65.000,00", "65000,00", "65000", "R$ 65.000,00"
  const raw = String(input ?? '').trim()
  if (!raw) return NaN

  const cleaned = raw.replace(/[^\d.,]/g, '')
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')
  return Number(normalized)
}

function formatBRLInput(raw: string) {
  // Digita números -> "12.345,67"
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''

  const intPart = digits.slice(0, -2) || '0'
  const decPart = digits.slice(-2).padStart(2, '0')
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${withThousands},${decPart}`
}

function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = 'red',
}: {
  title: string
  onPress: () => void
  disabled?: boolean
  variant?: 'red' | 'black'
}) {
  const bg = variant === 'red' ? BRAND.red : BRAND.black
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? BRAND.muted : bg,
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
  keyboardType,
}: {
  label: string
  value: string
  onChangeText: (t: string) => void
  placeholder?: string
  keyboardType?: 'default' | 'numeric'
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: BRAND.black, fontWeight: '900' }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.muted}
        keyboardType={keyboardType}
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

export default function EditVehicleScreen() {
  const route =
    useRoute<RouteProp<VehiclesStackParamList, 'EditVehicle'>>()

  const navigation = useNavigation<NavigationProp>()
  const queryClient = useQueryClient()

  const { vehicle } = route.params

  const [model, setModel] = useState(vehicle.model)
  const [year, setYear] = useState(String(vehicle.year))

  // ✅ FIX: vehicle.purchaseValue vem em REAIS (ex: 56000)
  // formatBRLInput espera CENTAVOS (ex: 5600000) pra virar "56.000,00"
  const [purchaseValue, setPurchaseValue] = useState(() => {
    const n = Number(vehicle.purchaseValue ?? 0)
    if (!n) return ''
    const cents = Math.round(n * 100)
    return formatBRLInput(String(cents))
  })

  const parsedYear = useMemo(() => Number(year), [year])
  const parsedPurchase = useMemo(
    () => parseBRLToNumber(purchaseValue),
    [purchaseValue]
  )

  function validate(): boolean {
    if (!model.trim()) {
      Alert.alert('Erro', 'Modelo é obrigatório')
      return false
    }

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 1900 ||
      parsedYear > 2100
    ) {
      Alert.alert('Erro', 'Ano inválido')
      return false
    }

    if (!parsedPurchase || Number.isNaN(parsedPurchase) || parsedPurchase <= 0) {
      Alert.alert('Erro', 'Valor de compra inválido. Ex: 45.000,00')
      return false
    }

    return true
  }

  const mutation = useMutation({
    mutationFn: async () => {
      return updateVehicle(vehicle.id, {
        model: model.trim(),
        year: parsedYear,
        purchaseValue: parsedPurchase,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', vehicle.id] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      navigation.goBack()
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.response?.data?.error || 'Erro ao atualizar')
    },
  })

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ padding: 16, gap: 14 }}>
        {/* HERO */}
        <View
          style={{
            backgroundColor: BRAND.black,
            borderRadius: 18,
            padding: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: BRAND.white, fontSize: 18, fontWeight: '900' }}>
            Editar veículo
          </Text>
          <Text style={{ color: BRAND.muted, fontWeight: '800' }}>
            {vehicle.plate}
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
            label="Modelo"
            value={model}
            onChangeText={setModel}
            placeholder="Ex: Onix Turbo"
          />

          <Input
            label="Ano"
            value={year}
            onChangeText={setYear}
            placeholder="Ex: 2020"
            keyboardType="numeric"
          />

          <Input
            label="Valor de compra"
            value={purchaseValue}
            onChangeText={(txt) => setPurchaseValue(formatBRLInput(txt))}
            placeholder="Ex: 45.000,00"
            keyboardType="numeric"
          />

          <PrimaryButton
            title={mutation.isPending ? 'Salvando...' : 'Salvar'}
            onPress={() => {
              if (!validate()) return
              mutation.mutate()
            }}
            disabled={mutation.isPending}
          />

          {mutation.isPending && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>

        {/* OBS */}
        <Text style={{ color: BRAND.muted, fontWeight: '700', fontSize: 12 }}>
          Dica: digite apenas números — o app formata automaticamente para moeda.
        </Text>
      </View>
    </SafeAreaView>
  )
}