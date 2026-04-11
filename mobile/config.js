// ============================================================
// LiveHub AI Service Configuration
// ============================================================
// IMPORTANT: Replace YOUR_LOCAL_IP with your computer's actual
// local IP address (e.g. 192.168.1.5).
//
// To find your IP:
//   Windows → run: ipconfig
//   Mac/Linux → run: ifconfig
//
// The mobile device and your computer must be on the SAME Wi-Fi.
// ============================================================

export const AI_BASE_URL = "http://10.190.158.66:8000";
export const ANALYZE_ENDPOINT = `${AI_BASE_URL}/analyze`;

export const BACKEND_URL = "http://10.190.158.66:5000";
export const SYNC_ENDPOINT = `${BACKEND_URL}/api/health/update`;
