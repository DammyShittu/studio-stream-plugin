import { useState, useCallback, useRef, useEffect } from 'react';
import { StreamConfig, StreamState } from '../types/index';
import { startStream, stopStream, subscribeToStats } from '../utils/api';

const INITIAL_STATE: StreamState = {
  status: 'IDLE',
  streamId: null,
  hlsUrl: null,
  workerId: null,
  startedAt: null,
  bitrate: null,
  error: null,
};

export function useStreamState(meetingId: string) {
  const [state, setState] = useState<StreamState>(INITIAL_STATE);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Cleanup stats subscription on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const start = useCallback(async (config: StreamConfig) => {
    setState(s => ({ ...s, status: 'STARTING', error: null }));

    try {
      const res = await startStream(meetingId, config);

      setState(s => ({
        ...s,
        status: 'LIVE',
        streamId: res.streamId,
        hlsUrl: res.hlsUrl,
        workerId: res.workerId,
        startedAt: Date.now(),
      }));

      // Subscribe to live bitrate stats
      unsubscribeRef.current = subscribeToStats(
        meetingId,
        (bitrate) => setState(s => ({ ...s, bitrate })),
        () => setState(s => ({ ...s, bitrate: null })),
      );
    } catch (err) {
      setState(s => ({
        ...s,
        status: 'ERROR',
        error: err instanceof Error ? err.message : 'Failed to start stream',
      }));
    }
  }, [meetingId]);

  const stop = useCallback(async () => {
    setState(s => ({ ...s, status: 'STOPPING' }));

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    try {
      await stopStream(meetingId);
      setState(INITIAL_STATE);
    } catch (err) {
      setState(s => ({
        ...s,
        status: 'ERROR',
        error: err instanceof Error ? err.message : 'Failed to stop stream',
      }));
    }
  }, [meetingId]);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, status: 'IDLE', error: null }));
  }, []);

  // Elapsed time in seconds
  const elapsed = state.startedAt
    ? Math.floor((Date.now() - state.startedAt) / 1000)
    : 0;

  return { state, start, stop, clearError, elapsed };
}
