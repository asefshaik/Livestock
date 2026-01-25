import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { SYNC_ENDPOINT } from '../config';

// ── Constants ─────────────────────────────────────────────────────────────────

const MIN_VALID_FRAMES = 3; // must match CameraScreen constant

const STATUS_THEME = {
  healthy:  { bg: '#E8F5E9', border: '#4CAF50', text: '#1B5E20', pill: '#4CAF50' },
  moderate: { bg: '#FFFDE7', border: '#FFC107', text: '#7B5800', pill: '#FFC107' },
  risk:     { bg: '#FFEBEE', border: '#F44336', text: '#B71C1C', pill: '#F44336' },
};
const STATUS_LABELS = {
  healthy:  '✅ Healthy',
  moderate: '⚠️ Moderate',
  risk:     '🚨 At Risk',
};

const TYPE_EMOJI = {
  cattle: '🐄', goat: '🐐', sheep: '🐑', pig: '🐷',
  poultry: '🐔', horse: '🐴', camel: '🐪', buffalo: '🦬', other: '🐾',
};

// ── Aggregation ───────────────────────────────────────────────────────────────

function aggregateFrameResults(frameResults, validFrameCount, livestockType) {
  const typeLabel = (livestockType || 'other').charAt(0).toUpperCase() + (livestockType || 'other').slice(1);

  if (!frameResults || frameResults.length === 0) {
    return { healthScore: 0, status: 'risk', noAnimal: true, insights: ['No frames were analyzed'], detectionRate: 0 };
  }

  // Enforce minimum valid frames gate
  if (validFrameCount < MIN_VALID_FRAMES) {
    return {
      healthScore: 0,
      status: 'risk',
      noAnimal: true,
      framesAnalyzed: frameResults.length,
      detectionRate: validFrameCount / Math.max(frameResults.length, 1),
      insights: [`Unable to analyze. Please scan the correct animal (${typeLabel})`],
    };
  }

  const total    = frameResults.length;
  const detected = frameResults.filter(f => f.detected);
  const detectionRate = detected.length / total;

  // Still not enough overall
  if (detectionRate < 0.25) {
    return {
      healthScore: 0,
      status: 'risk',
      detectionRate,
      framesAnalyzed: total,
      noAnimal: true,
      insights: [`Please scan a ${typeLabel} — not enough detections`],
    };
  }

  const avgConf = detected.reduce((s, f) => s + (f.confidence || 0), 0) / detected.length;
  const avgPose = detected.reduce((s, f) => s + (f.pose_score || 50), 0) / detected.length;
  const mean    = avgConf;
  const variance = detected.reduce((s, f) => s + Math.pow((f.confidence || 0) - mean, 2), 0) / detected.length;
  const activityScore = Math.min(Math.sqrt(variance) * 500, 100);

  const healthScore = Math.round(Math.min(100, Math.max(0,
    avgConf * 100 * 0.35 +
    detectionRate * 100 * 0.25 +
    avgPose * 0.25 +
    activityScore * 0.15
  )));

  const status = healthScore > 75 ? 'healthy' : healthScore >= 50 ? 'moderate' : 'risk';

  const insights = [];
  if (activityScore < 25) insights.push('Low activity detected');
  if (avgPose < 50)        insights.push('Unstable posture observed');
  if (avgConf < 0.5)       insights.push('Low detection confidence — ensure animal is fully visible');
  if (detectionRate < 0.6) insights.push('Animal was not consistently visible');

  return {
    healthScore,
    status,
    detectionRate,
    framesAnalyzed: total,
    detectedFrames: detected.length,
    avgConfidence: Math.round(avgConf * 100),
    noAnimal: false,
    insights,
  };
}

// ── Score Display ─────────────────────────────────────────────────────────────

function ScoreDisplay({ score, color }) {
  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Text style={{ fontSize: 64, fontWeight: '800', color, lineHeight: 72 }}>{score}</Text>
      <Text style={{ fontSize: 13, color, opacity: 0.7, fontWeight: '600' }}>/ 100</Text>
    </View>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ResultScreen({ navigation, route }) {
  const frameResults    = route?.params?.frameResults    ?? [];
  const validFrameCount = route?.params?.validFrameCount ?? frameResults.filter(f => f.detected).length;
  const livestockId     = route?.params?.livestockId     ?? null;
  const livestockType   = route?.params?.livestockType   ?? 'other';
  const duration        = route?.params?.recordingDuration ?? 0;

  const typeLabel = livestockType.charAt(0).toUpperCase() + livestockType.slice(1);
  const typeEmoji = TYPE_EMOJI[livestockType] ?? '🐾';

  const analysis = useMemo(
    () => aggregateFrameResults(frameResults, validFrameCount, livestockType),
    [frameResults, validFrameCount, livestockType]
  );

  const theme = STATUS_THEME[analysis.status] ?? STATUS_THEME.moderate;
  const [syncStatus, setSyncStatus] = useState('idle');

  const syncWithBackend = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(SYNC_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          livestockId,
          healthScore:   analysis.healthScore,
          status:        analysis.status,
          livestockType,
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setSyncStatus('success');
    } catch (err) {
      setSyncStatus('error');
    }
  };

  // ── No-animal / min-detection error ──────────────────────────────────────────

  if (analysis.noAnimal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noAnimalContainer}>
          <Text style={styles.noAnimalEmoji}>{typeEmoji}</Text>
          <Text style={styles.noAnimalTitle}>Unable to Analyze</Text>
          <Text style={styles.noAnimalMessage}>
            {analysis.insights[0] ?? `Not enough ${typeLabel} detected in the recording.`}
          </Text>
          <View style={styles.statsRow}>
            <MiniStat label="Frames" value={String(analysis.framesAnalyzed ?? 0)} />
            <MiniStat label="Detected" value={`${Math.round((analysis.detectionRate ?? 0) * 100)}%`} />
          </View>
          <TouchableOpacity style={styles.scanAgainBtn} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.scanAgainText}>🎥 Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Animal type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{typeEmoji} {typeLabel}</Text>
        </View>

        {/* Livestock ID badge */}
        {livestockId && (
          <View style={styles.idBadge}>
            <Text style={styles.idBadgeText}>🆔 {livestockId}</Text>
          </View>
        )}

        {/* Score card */}
        <View style={[styles.scoreCard, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <View style={[styles.statusPill, { backgroundColor: theme.pill }]}>
            <Text style={styles.statusPillText}>{STATUS_LABELS[analysis.status]}</Text>
          </View>
          <ScoreDisplay score={analysis.healthScore} color={theme.text} />
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${analysis.healthScore}%`, backgroundColor: theme.border }]} />
          </View>
        </View>

        {/* Scan stats */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Scan Summary</Text>
          <View style={styles.statsGrid}>
            <StatCell label="Frames Analyzed"  value={String(analysis.framesAnalyzed)} />
            <StatCell label="Animal Detected"  value={`${Math.round(analysis.detectionRate * 100)}%`} />
            <StatCell label="Avg Confidence"   value={`${analysis.avgConfidence}%`} />
            <StatCell label="Duration"         value={`${duration}s`} />
          </View>
        </View>

        {/* AI Insights */}
        {analysis.insights.length > 0 && (
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>💡 AI Insights</Text>
            {analysis.insights.map((t, i) => (
              <View key={i} style={styles.insightRow}>
                <View style={styles.insightDot} />
                <Text style={styles.insightText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Save to Listing */}
        {livestockId && (
          <View style={styles.syncCard}>
            {syncStatus === 'idle' && (
              <TouchableOpacity style={styles.saveBtn} onPress={syncWithBackend}>
                <Text style={styles.saveBtnText}>💾 Save to Listing</Text>
              </TouchableOpacity>
            )}
            {syncStatus === 'syncing' && (
              <View style={styles.syncRow}>
                <ActivityIndicator size="small" color="#1565C0" />
                <Text style={styles.syncText}>Syncing...</Text>
              </View>
            )}
            {syncStatus === 'success' && (
              <Text style={styles.syncSuccess}>✅ Health Score Saved to Listing</Text>
            )}
            {syncStatus === 'error' && (
              <View style={styles.syncRow}>
                <Text style={styles.syncError}>❌ Sync failed — </Text>
                <TouchableOpacity onPress={syncWithBackend}>
                  <Text style={styles.syncRetry}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Scan Again */}
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.scanAgainText}>🎥 Scan Again</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCell({ label, value }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statCellValue}>{value}</Text>
      <Text style={styles.statCellLabel}>{label}</Text>
    </View>
  );
}
function MiniStat({ label, value }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F0' },
  container: { padding: 20, paddingBottom: 44, alignItems: 'center' },

  // type + ID badges
  typeBadge: {
    backgroundColor: '#2E7D32', paddingVertical: 6, paddingHorizontal: 18,
    borderRadius: 20, marginBottom: 8, alignSelf: 'center',
  },
  typeBadgeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  idBadge: {
    backgroundColor: '#E3F2FD', paddingVertical: 5, paddingHorizontal: 14,
    borderRadius: 18, marginBottom: 16, borderWidth: 1, borderColor: '#90CAF9',
  },
  idBadgeText: { color: '#1565C0', fontWeight: '700', fontSize: 13 },

  // Score Card
  scoreCard: {
    width: '100%', padding: 26, borderRadius: 20, borderWidth: 2,
    alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  statusPill: {
    paddingVertical: 4, paddingHorizontal: 16, borderRadius: 20, marginBottom: 16,
  },
  statusPillText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  barTrack: {
    width: '100%', height: 8, backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4, overflow: 'hidden', marginTop: 16,
  },
  barFill: { height: '100%', borderRadius: 4 },

  // Stats Card
  statsCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statsTitle: {
    fontSize: 11, fontWeight: '700', color: '#888',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCell: {
    width: '48%', backgroundColor: '#F8F8F8', borderRadius: 10,
    padding: 13, marginBottom: 10, alignItems: 'center',
  },
  statCellValue: { fontSize: 22, fontWeight: '800', color: '#222' },
  statCellLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },

  // Insight Card
  insightCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 20,
    marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  insightTitle: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  insightDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFC107',
    marginRight: 10, marginTop: 5,
  },
  insightText: { fontSize: 14, color: '#555', flex: 1, lineHeight: 20 },

  // Sync Card
  syncCard: {
    width: '100%', backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 16, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  saveBtn: {
    backgroundColor: '#1565C0', paddingVertical: 14, paddingHorizontal: 36,
    borderRadius: 12, width: '100%', alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  syncRow: { flexDirection: 'row', alignItems: 'center' },
  syncText: { marginLeft: 10, color: '#1565C0', fontSize: 14, fontWeight: '500' },
  syncSuccess: { color: '#2E7D32', fontWeight: '700', fontSize: 15 },
  syncError: { color: '#D32F2F', fontWeight: '600', fontSize: 14 },
  syncRetry: { color: '#1565C0', fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },

  // Scan Again
  scanAgainBtn: {
    backgroundColor: '#2E7D32', paddingVertical: 16, width: '100%',
    borderRadius: 14, alignItems: 'center', marginTop: 4,
    shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  scanAgainText: { color: '#fff', fontWeight: '700', fontSize: 17 },

  // No-animal / error state
  noAnimalContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  noAnimalEmoji: { fontSize: 60, marginBottom: 16 },
  noAnimalTitle: { fontSize: 22, fontWeight: '800', color: '#333', marginBottom: 10, textAlign: 'center' },
  noAnimalMessage: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  miniStat: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', minWidth: 100,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  miniStatValue: { fontSize: 24, fontWeight: '800', color: '#333' },
  miniStatLabel: { fontSize: 11, color: '#888', marginTop: 4 },
});
