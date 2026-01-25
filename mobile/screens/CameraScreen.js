import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AI_BASE_URL } from '../config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FRAME_INTERVAL_MS = 700;
const MIN_VALID_FRAMES  = 3;   // minimum detected frames required before scoring is allowed
const SMOOTH_WINDOW     = 3;   // rolling window for bbox smoothing

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Smooth a bbox by averaging the last N detections
function smoothBBox(history) {
  if (!history.length) return null;
  const n = history.length;
  return {
    x:      history.reduce((s, b) => s + b.x, 0) / n,
    y:      history.reduce((s, b) => s + b.y, 0) / n,
    width:  history.reduce((s, b) => s + b.width, 0) / n,
    height: history.reduce((s, b) => s + b.height, 0) / n,
  };
}

async function sendFrameToAI(base64Jpeg, livestockType) {
  const response = await fetch(`${AI_BASE_URL}/analyze-frame`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frame_b64: base64Jpeg, livestock_type: livestockType }),
  });
  if (!response.ok) throw new Error(`Frame API ${response.status}`);
  return response.json();
}

export default function CameraScreen({ navigation, route }) {
  const livestockId   = route?.params?.livestockId   ?? null;
  const livestockType = route?.params?.livestockType ?? 'other';
  const typeLabel     = livestockType.charAt(0).toUpperCase() + livestockType.slice(1);

  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording]   = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [liveDetection, setLiveDetection] = useState(null);
  const [smoothedBBox, setSmoothedBBox]   = useState(null);
  const [isStopping, setIsStopping]       = useState(false);
  const [wrongAnimal, setWrongAnimal]     = useState(false);
  const [autoDetectedType, setAutoDetectedType] = useState(null); // shown in auto mode

  const cameraRef         = useRef(null);
  const frameIntervalRef  = useRef(null);
  const timerIntervalRef  = useRef(null);
  const recordingFramesRef = useRef([]);
  const isRecordingRef    = useRef(false);
  const isSamplingRef     = useRef(false);
  const bboxHistoryRef    = useRef([]);   // rolling window for bbox smoothing
  const validCountRef     = useRef(0);    // frames where correct animal detected
  const elapsedRef        = useRef(0);    // mirror elapsed for stopRecording closure

  // Wrong-animal banner animation
  const warnOpacity = useRef(new Animated.Value(0)).current;

  const showWrongAnimalBanner = useCallback(() => {
    setWrongAnimal(true);
    Animated.sequence([
      Animated.timing(warnOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(warnOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setWrongAnimal(false));
  }, []);

  // ── Timer ─────────────────────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    elapsedRef.current = 0;
    setElapsed(0);
    timerIntervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsed(v => v + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // ── Frame Sampling ────────────────────────────────────────────────────────────

  const startFrameSampling = useCallback(() => {
    recordingFramesRef.current = [];
    validCountRef.current = 0;
    bboxHistoryRef.current = [];
    isSamplingRef.current = false;

    frameIntervalRef.current = setInterval(async () => {
      if (!isRecordingRef.current || isSamplingRef.current) return;
      if (!cameraRef.current) return;

      isSamplingRef.current = true;
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.35,
          base64: true,
          skipProcessing: true,
          shutterSound: false,
        });

        if (!photo?.base64 || !isRecordingRef.current) return;

        const result = await sendFrameToAI(photo.base64, livestockType);
        if (!isRecordingRef.current) return;

        // ── Blur rejection: skip this frame entirely ──────────────────────────
        if (result.is_blurry) return;

        // ── Wrong-animal feedback ─────────────────────────────────────────────
        if (result.wrong_animal) {
          showWrongAnimalBanner();
        }

        // ── Accumulate valid frames ───────────────────────────────────────────
        recordingFramesRef.current.push(result);
        if (result.detected) validCountRef.current += 1;

        // ── Track auto-detected type ──────────────────────────────────────────
        if (result.detected && result.detected_type) {
          setAutoDetectedType(result.detected_type);
        } else if (!result.detected) {
          setAutoDetectedType(null);
        }

        // ── Update live detection state ───────────────────────────────────────
        setLiveDetection(result);

        // ── Smooth bounding box ───────────────────────────────────────────────
        if (result.detected && result.bbox) {
          bboxHistoryRef.current.push(result.bbox);
          if (bboxHistoryRef.current.length > SMOOTH_WINDOW) {
            bboxHistoryRef.current.shift();
          }
          // Only update bbox if all recent frames agree (reduces flicker)
          if (bboxHistoryRef.current.length >= SMOOTH_WINDOW) {
            setSmoothedBBox(smoothBBox(bboxHistoryRef.current));
          }
        } else {
          // Animal left frame — gradually clear bbox
          bboxHistoryRef.current = [];
          setSmoothedBBox(null);
        }
      } catch (e) {
        // Silently ignore transient camera/network errors
      } finally {
        isSamplingRef.current = false;
      }
    }, FRAME_INTERVAL_MS);
  }, [livestockType, showWrongAnimalBanner]);

  const stopFrameSampling = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  }, []);

  // ── Recording Control ─────────────────────────────────────────────────────────

  const startRecording = async () => {
    if (isRecording || isStopping) return;
    isRecordingRef.current = true;
    setIsRecording(true);
    setLiveDetection(null);
    setSmoothedBBox(null);
    startTimer();
    startFrameSampling();
  };

  const stopRecording = async () => {
    if (!isRecording || isStopping) return;
    setIsStopping(true);
    isRecordingRef.current = false;
    stopTimer();
    stopFrameSampling();

    await new Promise(r => setTimeout(r, 120));
    const collectedFrames = [...recordingFramesRef.current];
    const validFrames     = validCountRef.current;
    const duration        = elapsedRef.current;

    setIsRecording(false);
    setIsStopping(false);

    navigation.replace('Result', {
      frameResults:    collectedFrames,
      validFrameCount: validFrames,
      livestockId,
      livestockType,
      recordingDuration: duration,
    });
  };

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      stopTimer();
      stopFrameSampling();
    };
  }, []);

  // ── Permission States ─────────────────────────────────────────────────────────

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permTitle}>📷 Camera Access Needed</Text>
        <Text style={styles.permMessage}>
          PashuBazaar needs camera access to scan livestock.
        </Text>
        <TouchableOpacity style={styles.allowBtn} onPress={requestPermission}>
          <Text style={styles.allowBtnText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backTextBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backTextBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Derived display values ────────────────────────────────────────────────────

  const isAuto    = livestockType === 'auto';
  const detected   = liveDetection?.detected ?? false;
  // In auto mode show discovered type; in manual mode show the selected label
  const displayLabel = isAuto
    ? (autoDetectedType ?? (detected ? 'Animal' : null))
    : typeLabel;
  const statusText = liveDetection?.status_text ?? (isRecording ? `Scanning...` : `Ready to scan ${isAuto ? '' : typeLabel}`);
  const confidence = liveDetection?.confidence ?? 0;

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView style={StyleSheet.absoluteFill} ref={cameraRef} facing="back" />

      {/* ── Bounding Box + Label ───────────────────────────────────────────── */}
      {isRecording && detected && smoothedBBox && (
        <View
          pointerEvents="none"
          style={[
            styles.bbox,
            {
              left:   smoothedBBox.x * SCREEN_W,
              top:    smoothedBBox.y * SCREEN_H,
              width:  smoothedBBox.width  * SCREEN_W,
              height: smoothedBBox.height * SCREEN_H,
            },
          ]}
        >
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Label tag — shows animal type + confidence */}
          {displayLabel && (
            <View style={styles.bboxLabel}>
              <Text style={styles.bboxLabelText}>
                {displayLabel}{confidence > 0 ? `  ${Math.round(confidence * 100)}%` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* ── Top HUD ───────────────────────────────────────────────────────── */}
      <SafeAreaView style={styles.topHUD} pointerEvents="box-none">
        {!isRecording && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        {isRecording && (
          <View style={styles.recIndicator}>
            <View style={styles.recDot} />
            <Text style={styles.recTimer}>{formatTime(elapsed)}</Text>
            <Text style={styles.recFrameCount}>
              {' '}· {recordingFramesRef.current.length} frames
              {validCountRef.current > 0 ? ` · ${validCountRef.current} ✓` : ''}
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* ── Status chip ───────────────────────────────────────────────────── */}
      {isRecording && (
        <View
          pointerEvents="none"
          style={[
            styles.statusChip,
            { backgroundColor: detected ? 'rgba(0,180,90,0.88)' : 'rgba(20,20,20,0.72)' },
          ]}
        >
          <Text style={styles.statusChipText}>{statusText}</Text>
        </View>
      )}

      {/* ── Confidence bar ────────────────────────────────────────────────── */}
      {isRecording && detected && confidence > 0 && (
        <View style={styles.confidenceBar} pointerEvents="none">
          <View style={styles.confidenceTrack}>
            <View style={[styles.confidenceFill, { width: `${Math.round(confidence * 100)}%` }]} />
          </View>
          <Text style={styles.confidenceLabel}>Confidence {Math.round(confidence * 100)}%</Text>
        </View>
      )}

      {/* ── Minimum frame progress ────────────────────────────────────────── */}
      {isRecording && validCountRef.current < MIN_VALID_FRAMES && (
        <View style={styles.progressBar} pointerEvents="none">
          <View style={[
            styles.progressFill,
            { width: `${Math.min((validCountRef.current / MIN_VALID_FRAMES) * 100, 100)}%` },
          ]} />
          <Text style={styles.progressLabel}>
            Keep {typeLabel} in frame ({validCountRef.current}/{MIN_VALID_FRAMES} frames)
          </Text>
        </View>
      )}

      {/* ── Wrong-animal warning banner ───────────────────────────────────── */}
      <Animated.View
        pointerEvents="none"
        style={[styles.wrongAnimalBanner, { opacity: warnOpacity }]}
      >
        <Text style={styles.wrongAnimalText}>⚠️  Please scan a {typeLabel}</Text>
      </Animated.View>

      {/* ── Bottom Controls ───────────────────────────────────────────────── */}
      <View style={styles.bottomControls}>
        <Text style={styles.hint}>
          {isStopping ? 'Processing...' : isRecording ? 'Tap to stop & get results' : 'Tap to start scanning'}
        </Text>

        <TouchableOpacity
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? stopRecording : startRecording}
          disabled={isStopping}
          activeOpacity={0.8}
        >
          {isStopping ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : isRecording ? (
            <View style={styles.stopShape} />
          ) : (
            <View style={styles.startShape} />
          )}
        </TouchableOpacity>

        {/* Type badge below button */}
        <Text style={styles.typeBadge}>
          {isAuto
            ? (autoDetectedType ? `🔍 Detected: ${autoDetectedType}` : '🔍 Auto-detecting...')
            : `Scanning: ${typeLabel}`
          }
        </Text>
      </View>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F5F5F5', padding: 30,
  },
  loadingText: { marginTop: 16, fontSize: 16, color: '#555' },
  permTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 12, textAlign: 'center' },
  permMessage: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  allowBtn: {
    backgroundColor: '#2E7D32', paddingVertical: 14, paddingHorizontal: 40,
    borderRadius: 10, width: '80%', alignItems: 'center', marginBottom: 12,
  },
  allowBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backTextBtn: { paddingVertical: 10 },
  backTextBtnText: { color: '#2E7D32', fontSize: 15 },

  // Bounding box
  bbox: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#00E676',
    borderRadius: 6,
  },
  // Label tag — sits above the bbox
  bboxLabel: {
    position: 'absolute',
    top: -28,
    left: -2,
    backgroundColor: '#00E676',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bboxLabelText: { color: '#000', fontWeight: '800', fontSize: 12 },

  // Corner accents
  corner: { position: 'absolute', width: 14, height: 14, borderColor: '#00E676' },
  cornerTL: { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 3 },
  cornerTR: { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 3 },
  cornerBL: { bottom: -2, left: -2, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 3 },
  cornerBR: { bottom: -2, right: -2, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 3 },

  // Top HUD
  topHUD: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-start', padding: 16,
  },
  backBtn: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  recIndicator: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20,
  },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#F44336', marginRight: 8 },
  recTimer: { color: '#fff', fontSize: 15, fontWeight: '700' },
  recFrameCount: { color: 'rgba(255,255,255,0.65)', fontSize: 12 },

  // Status chip
  statusChip: {
    position: 'absolute',
    top: SCREEN_H * 0.11,
    alignSelf: 'center',
    paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20,
  },
  statusChipText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Confidence bar
  confidenceBar: {
    position: 'absolute', top: SCREEN_H * 0.17,
    left: 24, right: 24, alignItems: 'center',
  },
  confidenceTrack: {
    width: '100%', height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2, overflow: 'hidden', marginBottom: 4,
  },
  confidenceFill: { height: '100%', backgroundColor: '#00E676', borderRadius: 2 },
  confidenceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },

  // Minimum frame progress bar (bottom of screen, above controls)
  progressBar: {
    position: 'absolute',
    bottom: 165, left: 24, right: 24, alignItems: 'center',
  },
  progressFill: {
    height: 3, backgroundColor: '#FFC107', borderRadius: 2,
    alignSelf: 'flex-start',
  },
  progressLabel: { color: 'rgba(255,200,0,0.9)', fontSize: 11, marginTop: 4, fontWeight: '600' },

  // Wrong-animal banner
  wrongAnimalBanner: {
    position: 'absolute',
    top: SCREEN_H * 0.27,
    left: 28, right: 28,
    backgroundColor: 'rgba(255,152,0,0.92)',
    borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 18,
    alignItems: 'center',
  },
  wrongAnimalText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Bottom controls
  bottomControls: {
    position: 'absolute', bottom: 44, left: 0, right: 0, alignItems: 'center',
  },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 14, fontWeight: '500' },
  recordButton: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  recordButtonActive: { borderColor: '#F44336', backgroundColor: 'rgba(244,67,54,0.2)' },
  startShape: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F44336' },
  stopShape: { width: 30, height: 30, borderRadius: 4, backgroundColor: '#F44336' },
  typeBadge: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12, marginTop: 10, fontWeight: '500',
  },
});
