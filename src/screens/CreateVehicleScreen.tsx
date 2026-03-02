import React, { useMemo, useState } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVehicle } from "../services/api/vehicles";
import { useNavigation } from "@react-navigation/native";

const BRAND = {
  red: "#C1121F",
  black: "#0B0B0B",
  white: "#FFFFFF",
  gray: "#E5E5E5",
  lightGray: "#F5F5F5",
  muted: "#9CA3AF",
};

function parseBRLToNumber(input: string): number {
  // Aceita "65.000,00", "65000,00", "65000", "R$ 65.000,00"
  const raw = String(input ?? "").trim();
  if (!raw) return NaN;

  const cleaned = raw.replace(/[^\d.,]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

function formatBRLInput(raw: string) {
  // Digita números -> "12.345,67"
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  const intPart = digits.slice(0, -2) || "0";
  const decPart = digits.slice(-2).padStart(2, "0");
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withThousands},${decPart}`;
}

function PrimaryButton({
  title,
  onPress,
  disabled,
  variant = "red",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: "red" | "black";
}) {
  const bg = variant === "red" ? BRAND.red : BRAND.black;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? BRAND.muted : bg,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
      }}
    >
      <Text style={{ color: BRAND.white, fontWeight: "900" }}>{title}</Text>
    </Pressable>
  );
}

function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  autoCapitalize?: "none" | "characters" | "sentences" | "words";
  maxLength?: number;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: BRAND.black, fontWeight: "900" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={BRAND.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        style={{
          borderWidth: 1,
          borderColor: BRAND.gray,
          backgroundColor: BRAND.lightGray,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: BRAND.black,
          fontWeight: "800",
        }}
      />
    </View>
  );
}

export default function CreateVehicleScreen() {
  const navigation = useNavigation();
  const qc = useQueryClient();

  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2022");

  // moeda BR formatada
  const [purchaseValue, setPurchaseValue] = useState("50.000,00");

  const parsedYear = useMemo(() => Number(year), [year]);
  const parsedPurchase = useMemo(
    () => parseBRLToNumber(purchaseValue),
    [purchaseValue]
  );

  function validate(): boolean {
    const p = plate.trim().toUpperCase().replace(/\s/g, "");
    const m = model.trim();

    if (!p || !m || !year || !purchaseValue) {
      Alert.alert("Erro", "Preencha todos os campos");
      return false;
    }

    if (!Number.isInteger(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
      Alert.alert("Erro", "Ano inválido");
      return false;
    }

    if (!parsedPurchase || Number.isNaN(parsedPurchase) || parsedPurchase <= 0) {
      Alert.alert("Erro", "Valor de compra inválido. Ex: 45.000,00");
      return false;
    }

    // opcional: valida placa mínima (sem exagero)
    if (p.length < 6) {
      Alert.alert("Erro", "Placa inválida");
      return false;
    }

    return true;
  }

  const mutation = useMutation({
    mutationFn: () =>
      createVehicle({
        plate: plate.trim().toUpperCase().replace(/\s/g, ""),
        model: model.trim(),
        year: parsedYear,
        purchaseValue: parsedPurchase,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["vehicles"] });
      Alert.alert("Sucesso", "Veículo criado");
      // @ts-ignore
      navigation.goBack();
    },
    onError: (e: any) => {
      const status = e?.response?.status;
      const backendMsg = e?.response?.data?.error;
      const msg = String(backendMsg || e?.message || "");

      const isDuplicatePlate =
        status === 409 ||
        msg.includes("Unique constraint failed") ||
        msg.includes("(`plate`)") ||
        msg.toLowerCase().includes("placa");

      if (isDuplicatePlate) {
        Alert.alert(
          "Placa já cadastrada",
          "Já existe um veículo com essa placa. Use outra placa ou edite o veículo existente."
        );
        return;
      }

      Alert.alert("Erro", backendMsg || "Falha ao criar veículo");
    },
  });

  function submit() {
    if (!validate()) return;
    mutation.mutate();
  }

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
          <Text style={{ color: BRAND.white, fontSize: 18, fontWeight: "900" }}>
            Novo veículo
          </Text>
          <Text style={{ color: BRAND.muted, fontWeight: "800" }}>
            Cadastre um veículo no estoque
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
            label="Placa"
            value={plate}
            onChangeText={(t) => setPlate(t.toUpperCase())}
            placeholder="Ex: ABC1D23"
            autoCapitalize="characters"
            maxLength={10}
          />

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
            title={mutation.isPending ? "Salvando..." : "Salvar"}
            onPress={submit}
            disabled={mutation.isPending}
          />

          {mutation.isPending && <ActivityIndicator style={{ marginTop: 8 }} />}
        </View>

        <Text style={{ color: BRAND.muted, fontWeight: "700", fontSize: 12 }}>
          Dica: digite apenas números — o app formata automaticamente para moeda.
        </Text>
      </View>
    </SafeAreaView>
  );
}