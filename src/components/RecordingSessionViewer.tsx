import React from 'react';
import { UserProfile, BusinessScenario, RecordingSession } from '../types/index';
import { useRecordingSessionViewer } from '../hooks/useRecording';
import RecordingSessionViewerRender from '../render/RecordingSessionViewerRender';

interface RecordingSessionViewerProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  cloudRecordings: RecordingSession[];
  onClose: () => void;
  onRefreshCloud: () => void;
  userNamesMap?: Record<string, string>;
  onSelectRecording?: (recording: any) => void;
}

export default function RecordingSessionViewer(props: RecordingSessionViewerProps) {
  const {
    userProfile,
    scenarios,
    cloudRecordings,
    userNamesMap,
    onRefreshCloud
  } = props;

  const viewerState = useRecordingSessionViewer({
    userProfile,
    scenarios,
    cloudRecordings,
    userNamesMap,
    onRefreshCloud
  });

  return (
    <RecordingSessionViewerRender
      {...props}
      {...viewerState}
    />
  );
}
