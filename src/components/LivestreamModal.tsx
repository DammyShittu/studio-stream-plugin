import * as React from 'react';
import { useState } from 'react';
import {
  StreamConfig,
  StreamState,
  StreamPlatform,
  StreamQuality,
  PLATFORM_RTMP_URLS,
  QUALITY_LABELS,
} from '../types/index';
import { useElapsedTime } from '../hooks/useElapsedTime';

interface Props {
  state: StreamState;
  onStart: (config: StreamConfig) => void;
  onStop: () => void;
  onClose: () => void;
  onClearError: () => void;
}

const PLATFORM_ICONS: Record<StreamPlatform, string> = {
  youtube: '▶',
  facebook: 'f',
  twitch: '◈',
  custom: '⚡',
};

const PLATFORM_COLORS: Record<StreamPlatform, string> = {
  youtube: '#FF0000',
  facebook: '#1877F2',
  twitch: '#9146FF',
  custom: '#00C9A7',
};

export function LivestreamModal({
  state, onStart, onStop, onClose, onClearError,
}: Props) {
  const [platform, setPlatform] = useState<StreamPlatform>('youtube');
  const [streamKey, setStreamKey] = useState('');
  const [customRtmpUrl, setCustomRtmpUrl] = useState('');
  const [quality, setQuality] = useState<StreamQuality>('720p');
  const [showKey, setShowKey] = useState(false);
  const elapsed = useElapsedTime(state.startedAt);

  const handleStart = () => {
    const rtmpUrl = platform === 'custom'
      ? customRtmpUrl
      : PLATFORM_RTMP_URLS[platform];

    if (!rtmpUrl || !streamKey.trim()) return;

    onStart({ rtmpUrl, streamKey: streamKey.trim(), platform, quality });
  };

  const isLive = state.status === 'LIVE';
  const isTransitioning = state.status === 'STARTING' || state.status === 'STOPPING';
  const isError = state.status === 'ERROR';

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            {isLive && <span style={styles.liveBadge}>● LIVE</span>}
            <span style={styles.title}>Livestream</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* LIVE STATUS VIEW */}
        {isLive && (
          <div style={styles.liveView}>
            <div style={styles.statsRow}>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Duration</span>
                <span style={styles.statValue}>{elapsed}</span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Bitrate</span>
                <span style={styles.statValue}>
                  {state.bitrate ? `${state.bitrate} kbps` : '—'}
                </span>
              </div>
              <div style={styles.stat}>
                <span style={styles.statLabel}>Platform</span>
                <span style={{
                  ...styles.statValue,
                  color: PLATFORM_COLORS[platform],
                  textTransform: 'capitalize',
                }}>
                  {PLATFORM_ICONS[platform]} {platform}
                </span>
              </div>
            </div>

            {state.hlsUrl && (
              <div style={styles.hlsRow}>
                <span style={styles.hlsLabel}>Viewer URL</span>
                <div style={styles.hlsUrlBox}>
                  <span style={styles.hlsUrl}>{state.hlsUrl}</span>
                  <button
                    style={styles.copyBtn}
                    onClick={() => navigator.clipboard?.writeText(state.hlsUrl!)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            <button
              style={{ ...styles.btnBase, ...styles.btnStop }}
              onClick={onStop}
            >
              ⏹ Stop Stream
            </button>
          </div>
        )}

        {/* TRANSITIONING VIEW */}
        {isTransitioning && (
          <div style={styles.transitionView}>
            <div style={styles.spinner} />
            <p style={styles.transitionText}>
              {state.status === 'STARTING'
                ? 'Starting stream… this takes ~10 seconds'
                : 'Stopping stream…'}
            </p>
          </div>
        )}

        {/* ERROR VIEW */}
        {isError && (
          <div style={styles.errorView}>
            <span style={styles.errorIcon}>⚠</span>
            <p style={styles.errorText}>{state.error}</p>
            <button style={{ ...styles.btnBase, ...styles.btnSecondary }} onClick={onClearError}>
              Try Again
            </button>
          </div>
        )}

        {/* SETUP VIEW */}
        {state.status === 'IDLE' && (
          <div style={styles.setupView}>

            {/* Platform selector */}
            <label style={styles.label}>Platform</label>
            <div style={styles.platformGrid}>
              {(Object.keys(PLATFORM_RTMP_URLS) as StreamPlatform[]).map((p) => (
                <button
                  key={p}
                  style={{
                    ...styles.platformBtn,
                    ...(platform === p ? {
                      borderColor: PLATFORM_COLORS[p],
                      background: `${PLATFORM_COLORS[p]}18`,
                      color: PLATFORM_COLORS[p],
                    } : {}),
                  }}
                  onClick={() => setPlatform(p)}
                >
                  <span style={styles.platformIcon}>{PLATFORM_ICONS[p]}</span>
                  <span style={{ textTransform: 'capitalize' }}>{p}</span>
                </button>
              ))}
            </div>

            {/* Custom RTMP URL */}
            {platform === 'custom' && (
              <>
                <label style={styles.label}>RTMP URL</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="rtmp://your-server.com/live"
                  value={customRtmpUrl}
                  onChange={e => setCustomRtmpUrl(e.target.value)}
                />
              </>
            )}

            {/* Stream key */}
            <label style={styles.label}>Stream Key</label>
            <div style={styles.keyRow}>
              <input
                style={{ ...styles.input, flex: 1 }}
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your stream key"
                value={streamKey}
                onChange={e => setStreamKey(e.target.value)}
              />
              <button
                style={styles.showKeyBtn}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Quality */}
            <label style={styles.label}>Quality</label>
            <div style={styles.qualityRow}>
              {(Object.keys(QUALITY_LABELS) as StreamQuality[]).map((q) => (
                <button
                  key={q}
                  style={{
                    ...styles.qualityBtn,
                    ...(quality === q ? styles.qualityBtnActive : {}),
                  }}
                  onClick={() => setQuality(q)}
                >
                  {q}
                </button>
              ))}
            </div>
            <p style={styles.qualityHint}>{QUALITY_LABELS[quality]}</p>

            <button
              style={{
                ...styles.btnBase,
                ...styles.btnStart,
                ...(!streamKey.trim() || (platform === 'custom' && !customRtmpUrl)
                  ? styles.btnDisabled : {}),
              }}
              disabled={!streamKey.trim() || (platform === 'custom' && !customRtmpUrl)}
              onClick={handleStart}
            >
              🔴 Go Live
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Styles — inline for single-file bundle (no CSS loader dependency)
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(3px)',
  },
  modal: {
    background: '#1a1d23',
    border: '1px solid #2e3340',
    borderRadius: '12px',
    width: '420px',
    maxWidth: '95vw',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #2e3340',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    color: '#f0f2f5',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: 'system-ui, sans-serif',
  },
  liveBadge: {
    background: '#e53e3e',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
    animation: 'pulse 1.5s infinite',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#8b95a5',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    borderRadius: '6px',
    lineHeight: 1,
  },
  setupView: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#8b95a5',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginTop: '10px',
    fontFamily: 'system-ui, sans-serif',
  },
  platformGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '6px',
  },
  platformBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#232730',
    border: '1px solid #2e3340',
    borderRadius: '8px',
    color: '#9aa5b4',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    transition: 'all 0.15s',
  },
  platformIcon: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    background: '#232730',
    border: '1px solid #2e3340',
    borderRadius: '8px',
    color: '#f0f2f5',
    padding: '10px 14px',
    fontSize: '13px',
    fontFamily: 'monospace',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '6px',
  },
  keyRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    marginTop: '6px',
  },
  showKeyBtn: {
    background: '#232730',
    border: '1px solid #2e3340',
    borderRadius: '8px',
    color: '#8b95a5',
    cursor: 'pointer',
    padding: '10px 12px',
    fontSize: '12px',
    fontFamily: 'system-ui, sans-serif',
    whiteSpace: 'nowrap',
  },
  qualityRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
  },
  qualityBtn: {
    flex: 1,
    padding: '8px',
    background: '#232730',
    border: '1px solid #2e3340',
    borderRadius: '8px',
    color: '#8b95a5',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
  },
  qualityBtnActive: {
    background: '#1a3a2e',
    border: '1px solid #38a169',
    color: '#68d391',
  },
  qualityHint: {
    color: '#566070',
    fontSize: '11px',
    marginTop: '2px',
    fontFamily: 'system-ui, sans-serif',
  },
  btnBase: {
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    padding: '12px 20px',
    width: '100%',
    marginTop: '14px',
    fontFamily: 'system-ui, sans-serif',
    transition: 'opacity 0.15s',
  },
  btnStart: {
    background: '#e53e3e',
    color: '#fff',
  },
  btnStop: {
    background: '#2e3340',
    color: '#fc8181',
    border: '1px solid #e53e3e44',
  },
  btnSecondary: {
    background: '#2e3340',
    color: '#f0f2f5',
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  liveView: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
  },
  stat: {
    background: '#232730',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    border: '1px solid #2e3340',
  },
  statLabel: {
    color: '#566070',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontFamily: 'system-ui, sans-serif',
  },
  statValue: {
    color: '#f0f2f5',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  hlsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  hlsLabel: {
    color: '#566070',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    fontFamily: 'system-ui, sans-serif',
  },
  hlsUrlBox: {
    display: 'flex',
    alignItems: 'center',
    background: '#232730',
    border: '1px solid #2e3340',
    borderRadius: '8px',
    padding: '8px 12px',
    gap: '8px',
  },
  hlsUrl: {
    flex: 1,
    color: '#68d391',
    fontSize: '12px',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  copyBtn: {
    background: '#2e3340',
    border: '1px solid #3e4754',
    borderRadius: '6px',
    color: '#9aa5b4',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '4px 10px',
    fontFamily: 'system-ui, sans-serif',
  },
  transitionView: {
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #2e3340',
    borderTopColor: '#e53e3e',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  transitionText: {
    color: '#8b95a5',
    fontSize: '14px',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    margin: 0,
  },
  errorView: {
    padding: '32px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  errorIcon: {
    fontSize: '28px',
    color: '#fc8181',
  },
  errorText: {
    color: '#fc8181',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.5',
  },
};
