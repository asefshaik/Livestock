import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";

// ── Livestock type definitions ─────────────────────────────────────────────────

const LIVESTOCK_TYPES = [
  { key: "auto", label: "Auto-Detect", emoji: "🔍" },
  { key: "cattle", label: "Cattle", emoji: "🐄" },
  { key: "goat", label: "Goat", emoji: "🐐" },
  { key: "sheep", label: "Sheep", emoji: "🐑" },
  { key: "pig", label: "Pig", emoji: "🐷" },
  { key: "poultry", label: "Poultry", emoji: "🐔" },
  { key: "horse", label: "Horse", emoji: "🐴" },
  { key: "camel", label: "Camel", emoji: "🐪" },
  { key: "buffalo", label: "Buffalo", emoji: "🦬" },
  { key: "other", label: "Other", emoji: "🐾" },
];

export default function HomeScreen({ navigation }) {
  const [animalId, setAnimalId] = useState("");
  const [selectedType, setSelectedType] = useState("auto"); // default: auto-detect

  const selected =
    LIVESTOCK_TYPES.find((t) => t.key === selectedType) ?? LIVESTOCK_TYPES[0];

  const handleStartScan = () => {
    navigation.navigate("Camera", {
      livestockId: animalId.trim() || null,
      livestockType: selectedType,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Hero Header */}
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>{selected.emoji}</Text>
        <Text style={styles.heroTitle}>LiveHub</Text>
        <Text style={styles.heroSubtitle}>AI Livestock Health Scanner</Text>
      </View>

      {/* Card */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Livestock Type Picker ── */}
        <Text style={styles.sectionTitle}>Select Animal Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typePickerRow}
        >
          {LIVESTOCK_TYPES.map((type) => {
            const active = type.key === selectedType;
            return (
              <TouchableOpacity
                key={type.key}
                style={[styles.typePill, active && styles.typePillActive]}
                onPress={() => setSelectedType(type.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.typePillEmoji}>{type.emoji}</Text>
                <Text
                  style={[
                    styles.typePillLabel,
                    active && styles.typePillLabelActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.selectedBanner}>
          <Text style={styles.selectedBannerText}>
            {selected.key === "auto" ? (
              "🔍 AI will auto-detect the animal type"
            ) : (
              <>
                Scanning for:{" "}
                <Text style={styles.selectedBannerBold}>
                  {selected.emoji} {selected.label}
                </Text>
              </>
            )}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── How it works ── */}
        <Text style={styles.sectionTitle}>How it works</Text>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <Text style={styles.stepText}>Select animal type above</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <Text style={styles.stepText}>
            AI detects only that animal in real time
          </Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <Text style={styles.stepText}>
            Receive a health score after scanning
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Livestock ID ── */}
        <Text style={styles.label}>
          Livestock ID <Text style={styles.optional}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. LVS-12345"
          placeholderTextColor="#aaa"
          value={animalId}
          onChangeText={setAnimalId}
          autoCapitalize="characters"
          returnKeyType="done"
        />
        <Text style={styles.inputHint}>
          Enter ID to save results to your listing
        </Text>

        {/* ── CTA ── */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleStartScan}
          activeOpacity={0.85}
        >
          <Text style={styles.scanButtonIcon}>🎥</Text>
          <Text style={styles.scanButtonText}>Start Live Scan</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1B5E20" },

  hero: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 22,
    paddingHorizontal: 20,
  },
  heroEmoji: { fontSize: 48, marginBottom: 6 },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  cardContent: { padding: 24, paddingTop: 28, paddingBottom: 40 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 14,
  },

  // Type Picker
  typePickerRow: { paddingBottom: 6, paddingRight: 8 },
  typePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 40,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  typePillActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  typePillEmoji: { fontSize: 18, marginRight: 6 },
  typePillLabel: { fontSize: 13, fontWeight: "600", color: "#555" },
  typePillLabelActive: { color: "#fff" },

  selectedBanner: {
    marginTop: 12,
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#A5D6A7",
  },
  selectedBannerText: { fontSize: 13, color: "#388E3C" },
  selectedBannerBold: { fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#E8E8E8", marginVertical: 22 },

  stepRow: { flexDirection: "row", alignItems: "center", marginBottom: 11 },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNum: { color: "#fff", fontWeight: "700", fontSize: 12 },
  stepText: { fontSize: 14, color: "#333", flex: 1 },

  label: { fontSize: 14, fontWeight: "600", color: "#444", marginBottom: 8 },
  optional: { fontWeight: "400", color: "#888" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    color: "#222",
    marginBottom: 6,
  },
  inputHint: { fontSize: 12, color: "#999", marginBottom: 26, marginLeft: 2 },

  scanButton: {
    backgroundColor: "#2E7D32",
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  scanButtonIcon: { fontSize: 20, marginRight: 10 },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
