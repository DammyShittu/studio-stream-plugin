import {
  BbbPluginSdk,
  OptionsDropdownOption,
  pluginLogger,
} from 'bigbluebutton-html-plugin-sdk';
import * as React from 'react';
import { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import { LivestreamModal } from './components/LivestreamModal';
import { useStreamState } from './hooks/useStreamState';

interface LivestreamPluginProps {
  pluginUuid: string;
}

function LivestreamPlugin({ pluginUuid }: LivestreamPluginProps): React.ReactElement {
  BbbPluginSdk.initialize(pluginUuid);
  const pluginApi = BbbPluginSdk.getPluginApi(pluginUuid);

  const [modalOpen, setModalOpen] = useState(false);

  // Get current meeting context from BBB SDK
  const currentUser = pluginApi.useCurrentUser();
  const meetingInfo = pluginApi.useCurrentPresentation?.() ?? null;

  // Derive meetingId — fall back gracefully if API shape varies
  const meetingId: string = (currentUser as any)?.meetingId
    ?? (meetingInfo as any)?.meetingId
    ?? 'unknown';

  const isModerator = (currentUser as any)?.role === 'MODERATOR';

  const { state, start, stop, clearError } = useStreamState(meetingId);

  // Register the options dropdown button (only for moderators)
  useEffect(() => {
    if (!isModerator) return;

    const isLive = state.status === 'LIVE';

    pluginApi.setOptionsDropdownItems([
      new OptionsDropdownOption({
        label: isLive ? '⏹ Stop Livestream' : '🔴 Start Livestream',
        icon: isLive ? 'video_off' : 'video_on',
        onClick: () => {
          pluginLogger.info(`[LivestreamPlugin] Dropdown clicked — status: ${state.status}`);
          setModalOpen(true);
        },
      }),
    ]);
  }, [isModerator, state.status]);

  // Don't render anything for non-moderators
  if (!isModerator) return <></>;

  // Portal the modal to document.body so it floats above all BBB UI
  return ReactDOM.createPortal(
    <>
      {/* Inject keyframe animations */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {modalOpen && (
        <LivestreamModal
          state={state}
          onStart={async (config) => {
            await start(config);
          }}
          onStop={async () => {
            await stop();
          }}
          onClose={() => setModalOpen(false)}
          onClearError={clearError}
        />
      )}
    </>,
    document.body,
  ) as React.ReactElement;
}

export default LivestreamPlugin;
