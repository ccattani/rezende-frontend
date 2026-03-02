import React, { useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  TextInput,
  Pressable,
  Alert,
} from 'react-native'
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getVehicleById, sellVehicle, vehicleStatusLabel } from '../services/api/vehicles'
import type { VehiclesStackParamList } from '../app/RootNavigator'
import { useAuth } from '../store/auth'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  muted: '#9CA3AF',
}

type NavigationProp = NativeStackNavigationProp<VehiclesStackParamList, 'VehicleDetail'>

function parseBRLToNumber(input: string): number {
  // Aceita: "65000", "65.000", "65.000,00", "65000,50", "R$ 65.000,00"
  const raw = String(input ?? '').trim()
  if (!raw) return NaN

  // remove tudo que não for dígito, ponto ou vírgula
  const cleaned = raw.replace(/[^\d.,]/g, '')

  // remove separador de milhar "." e troca "," por "."
  const normalized = cleaned.replace(/\./g, '').replace(',', '.')

  const value = Number(normalized)
  return value
}

function formatBRLInput(raw: string) {
  // Formata no estilo "12.345,67" enquanto digita (simples e estável)
  const digits = raw.replace(/\D/g, '') // só números
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

function OutlineButton({
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
        borderWidth: 1,
        borderColor: BRAND.gray,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 14,
        alignItems: 'center',
        backgroundColor: BRAND.white,
      }}
    >
      <Text style={{ color: BRAND.black, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  )
}

export default function VehicleDetailScreen() {
  const route = useRoute<RouteProp<VehiclesStackParamList, 'VehicleDetail'>>()
  const navigation = useNavigation<NavigationProp>()
  const queryClient = useQueryClient()

  const { user } = useAuth()
  const { id } = route.params

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id),
  })

  const canManage = user?.role === 'CHEFE' || user?.role === 'COORDENADOR'
  const canEdit = canManage && data?.status === 'IN_STOCK'
  const canSell = canManage && data?.status === 'IN_STOCK'

  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [saleValue, setSaleValue] = useState('')

  const sellMutation = useMutation({
    mutationFn: async (value: number) => {
      if (!data) throw new Error('Veículo não carregado')
      return sellVehicle(data.id, { saleValue: value })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] })
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      setSellModalOpen(false)
      setSaleValue('')
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.response?.data?.error || 'Erro ao vender veículo')
    },
  })

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => refetch()} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: BRAND.white, fontWeight: '900' }}>Atualizar</Text>
        </Pressable>
      ),
    })
  }, [navigation, refetch])

  const statusInfo = useMemo(() => vehicleStatusLabel[data?.status ?? 'IN_STOCK'], [data?.status])

  function confirmSell() {
    const value = parseBRLToNumber(saleValue)

    if (!value || Number.isNaN(value) || value <= 0) {
      Alert.alert('Erro', 'Informe um valor válido. Ex: 65.000,00')
      return
    }

    sellMutation.mutate(value)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', backgroundColor: BRAND.white }}>
        <ActivityIndicator />
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 20, gap: 12, backgroundColor: BRAND.white }}>
        <Text style={{ fontWeight: '900', color: BRAND.black }}>Erro ao carregar veículo.</Text>
        <PrimaryButton title="Tentar novamente" onPress={() => refetch()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 14 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {/* HERO */}
        <View style={{ backgroundColor: BRAND.black, borderRadius: 18, padding: 18, gap: 8 }}>
          <Text style={{ color: BRAND.white, fontSize: 22, fontWeight: '900' }}>{data.model}</Text>
          <Text style={{ color: BRAND.muted, fontWeight: '700' }}>{data.year}</Text>

          {/* STATUS BADGE */}
          <View style={{ alignSelf: 'flex-start', backgroundColor: statusInfo.color, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Text style={{ color: statusInfo.textColor, fontWeight: '900', fontSize: 12 }}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* INFO CARD */}
        <View
          style={{
            borderWidth: 1,
            borderColor: BRAND.gray,
            backgroundColor: BRAND.lightGray,
            borderRadius: 18,
            padding: 16,
            gap: 10,
          }}
        >
          <Text style={{ color: BRAND.black }}>
            <Text style={{ fontWeight: '900' }}>Placa:</Text> {data.plate}
          </Text>

          <Text style={{ color: BRAND.black }}>
            <Text style={{ fontWeight: '900' }}>Compra:</Text> R$ {data.purchaseValue}
          </Text>

          <Text style={{ color: BRAND.black }}>
            <Text style={{ fontWeight: '900' }}>Venda:</Text>{' '}
            {data.saleValue ? `R$ ${data.saleValue}` : '-'}
          </Text>

          <Text style={{ color: BRAND.muted }}>
            Criado em: {new Date(data.createdAt).toLocaleString()}
          </Text>
        </View>

        {/* ACTIONS */}
        {canManage && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: BRAND.black }}>Ações</Text>

            {canEdit && (
              <PrimaryButton
                title="Editar"
                variant="black"
                onPress={() => navigation.navigate('EditVehicle', { vehicle: data })}
              />
            )}

            {canSell && (
              <PrimaryButton
                title={sellMutation.isPending ? 'Vendendo...' : 'Marcar como vendido'}
                onPress={() => setSellModalOpen(true)}
                disabled={sellMutation.isPending}
              />
            )}

            {!canEdit && !canSell && (
              <Text style={{ color: BRAND.muted, fontWeight: '700' }}>
                Veículo não pode ser editado/vendido porque não está em estoque.
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL DE VENDA */}
      <Modal
        visible={sellModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSellModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: BRAND.white,
              borderRadius: 18,
              padding: 16,
              gap: 12,
              borderWidth: 1,
              borderColor: BRAND.gray,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '900', color: BRAND.black }}>
              Valor da venda
            </Text>

            <TextInput
              placeholder="Ex: 65.000,00"
              placeholderTextColor={BRAND.muted}
              value={saleValue}
              onChangeText={(txt) => setSaleValue(formatBRLInput(txt))}
              keyboardType="numeric"
              style={{
                borderWidth: 1,
                borderColor: BRAND.gray,
                borderRadius: 14,
                padding: 12,
                backgroundColor: BRAND.lightGray,
                color: BRAND.black,
                fontWeight: '800',
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <OutlineButton title="Cancelar" onPress={() => setSellModalOpen(false)} />
              </View>

              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title={sellMutation.isPending ? 'Salvando...' : 'Confirmar'}
                  onPress={confirmSell}
                  disabled={sellMutation.isPending}
                />
              </View>
            </View>

            <Text style={{ color: BRAND.muted, fontSize: 12, fontWeight: '700' }}>
              Dica: digite apenas números — o app formata automaticamente.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}