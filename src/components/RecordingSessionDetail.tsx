import React from 'react';
import { BusinessScenario } from '../types/index';
import { useRecordingSessionDetail } from '../hooks/useRecording';
import RecordingSessionDetailRender from '../render/RecordingSessionDetailRender';

interface RecordingSessionDetailProps {
  recording: {
    id: string;
    title: string;
    scenarioId: string;
    scenarioTitle: string;
    scenarioCategory: string;
    agentId: string | null;
    agentName: string;
    trainerId?: string;
    trainerName?: string;
    duration: number;
    createdAt: string;
    cloudAudioUrl?: string;
    hasLocal: boolean;
    hasCloud: boolean;
    isUploaded: boolean;
    notes?: string;
  };
  scenarios: BusinessScenario[];
  onClose: () => void;
  userNamesMap?: Record<string, string>;
}

export default function RecordingSessionDetail(props: RecordingSessionDetailProps) {
  const { recording } = props;
  const detailState = useRecordingSessionDetail({ recording });

  return (
    <RecordingSessionDetailRender
      {...props}
      {...detailState}
    />
  );
}
