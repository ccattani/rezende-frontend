import React, { useLayoutEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
  TextInput,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useQuery } from '@tanstack/react-query'
import {
  listVehicles,
  type VehicleStatus,
  vehicleStatusLabel,
} from '../services/api/vehicles'
import { useAuth } from '../store/auth'
import type { VehiclesStackParamList } from '../app/RootNavigator'

const BRAND = {
  red: '#C1121F',
  black: '#0B0B0B',
  white: '#FFFFFF',
  gray: '#E5E5E5',
  lightGray: '#F5F5F5',
  muted: '#9CA3AF',
}

function normalize(s: string) {
  return s.trim().toLowerCase()
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
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
      }}
    >
      <Text style={{ color: BRAND.white, fontWeight: '800' }}>{title}</Text>
    </Pressable>
  )
}

function Chip({
  title,
  active,
  onPress,
}: {
  title: string
  active: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? BRAND.red : BRAND.gray,
        backgroundColor: active ? BRAND.red : BRAND.white,
      }}
    >
      <Text style={{ color: active ? BRAND.white : BRAND.black, fontWeight: '700' }}>
        {title}
      </Text>
    </Pressable>
  )
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const s = vehicleStatusLabel[status]
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: s.color,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: s.textColor, fontWeight: '800', fontSize: 12 }}>
        {s.label}
      </Text>
    </View>
  )
}

export default function VehiclesListScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<VehiclesStackParamList>>()

  const { user } = useAuth()

  const [status, setStatus] = useState<VehicleStatus | 'ALL'>('ALL')
  const [q, setQ] = useState('')

  const canCreate = user?.role === 'CHEFE' || user?.role === 'COORDENADOR'

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        canCreate ? (
          <PrimaryButton
            title="Novo"
            onPress={() => navigation.navigate('CreateVehicle')}
          />
        ) : null,
    })
  }, [navigation, canCreate])

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ['vehicles', status],
    queryFn: () => listVehicles(status === 'ALL' ? undefined : { status }),
  })

  const vehicles = useMemo(() => {
    const arr = data ?? []
    const query = normalize(q)
    if (!query) return arr

    return arr.filter((v) => {
      const plate = normalize(v.plate)
      const model = normalize(v.model)
      const year = String(v.year)
      return plate.includes(query) || model.includes(query) || year.includes(query)
    })
  }, [data, q])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BRAND.white }}>
      <View style={{ padding: 16, gap: 12 }}>
        {/* SEARCH */}
        <View
          style={{
            backgroundColor: BRAND.lightGray,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: BRAND.gray,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        >
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Buscar por placa, modelo ou ano..."
            placeholderTextColor={BRAND.muted}
            autoCapitalize="none"
            style={{ color: BRAND.black, fontSize: 14 }}
          />
        </View>

        {/* FILTERS */}
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Chip title="Todos" active={status === 'ALL'} onPress={() => setStatus('ALL')} />
          <Chip title="Em estoque" active={status === 'IN_STOCK'} onPress={() => setStatus('IN_STOCK')} />
          <Chip title="Vendidos" active={status === 'SOLD'} onPress={() => setStatus('SOLD')} />
          <Chip title="Cancelados" active={status === 'CANCELED'} onPress={() => setStatus('CANCELED')} />
        </View>
      </View>

      {/* CONTENT */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: BRAND.black, fontWeight: '800' }}>
            Falha ao carregar veículos.
          </Text>
          <PrimaryButton title="Tentar novamente" onPress={() => refetch()} />
        </View>
      ) : vehicles.length === 0 ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: BRAND.black, fontWeight: '800' }}>
            Nenhum veículo encontrado.
          </Text>
          <PrimaryButton title="Atualizar" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          data={vehicles}
          keyExtractor={(item) => item.id}
          onRefresh={refetch}
          refreshing={isFetching}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate('VehicleDetail', { id: item.id })}
              style={{
                backgroundColor: BRAND.white,
                borderWidth: 1,
                borderColor: BRAND.gray,
                borderRadius: 16,
                padding: 14,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: BRAND.black }}>
                    {item.model} ({item.year})
                  </Text>

                  <Text style={{ marginTop: 6, color: BRAND.black }}>
                    Placa: <Text style={{ fontWeight: '800' }}>{item.plate}</Text>
                  </Text>
                </View>

                <StatusBadge status={item.status} />
              </View>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  )
}