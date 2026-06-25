import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, BusinessScenario, RecordingSessionViewModel } from '../types/index';
import { useRecordingMutations } from '../hooks/useRecording';
import RecordingDashboardTabRender from '../render/dashboard/RecordingDashboardTabRender';
import { useServices } from '../services/ServiceContext';
import { showToast } from '../utils';

interface RecordingDashboardTabProps {
  userProfile: UserProfile;
  scenarios: BusinessScenario[];
  recordings: RecordingSessionViewModel[];
  userNamesMap: Record<string, string>;
  onRefresh: () => void;
  onViewDetails?: (recording: any) => void;
}

export default function RecordingDashboardTab(props: RecordingDashboardTabProps) {
  const {
    userProfile,
    scenarios,
    recordings,
    userNamesMap,
    onRefresh,
    onViewDetails
  } = props;

  const { userService } = useServices();
  const mutations = useRecordingMutations({ userProfile, scenarios, userNamesMap, onRefresh });

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // External Form State
  const [showAddExternal, setShowAddExternal] = useState(false);
  const [extTitle, setExtTitle] = useState('');
  const [extScenarioId, setExtScenarioId] = useState('');
  const [extAgentId, setExtAgentId] = useState('');
  const [extDuration, setExtDuration] = useState<number>(30);
  const [extFile, setExtFile] = useState<File | null>(null);
  const [addingExternal, setAddingExternal] = useState(false);

  // Link State
  const [linkingRecId, setLinkingRecId] = useState<string | null>(null);
  const [linkingAgentId, setLinkingAgentId] = useState('');
  const [linkingScenarioId, setLinkingScenarioId] = useState('');

  // Audio Playback State
  const [activePlayId, setActivePlayId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingAudioBlob, setLoadingAudioBlob] = useState(false);
  
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const [agentsList, setAgentsList] = useState<UserProfile[]>([]);

  useEffect(() => {
    userService.getUsers().then(users => {
      setAgentsList(users.filter(u => u.role === 'agent'));
    }).catch(err => {
      console.warn("Could not load agents list", err);
    });
  }, [userService]);

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // Filter recordings based on UI state
  const filteredRecords = recordings.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.scenarioTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.scenarioCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePlayRecording = async (recId: string, cloudUrl?: string) => {
    if (activePlayId === recId && isPlaying) {
      audioPlayerRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (activePlayId === recId && audioPlayerRef.current) {
      audioPlayerRef.current.play();
      setIsPlaying(true);
      return;
    }

    audioPlayerRef.current?.pause();
    setLoadingAudioBlob(true);

    try {
      const playbackSrc = await mutations.resolveAudioUrl(recId, cloudUrl);
      const audio = new Audio(playbackSrc);
      
      audio.oncanplaythrough = () => {
        setLoadingAudioBlob(false);
        audio.play();
        setIsPlaying(true);
      };
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        showToast("Gagal memutar audio. Pastikan tipe file audio disupport.", "error");
        setLoadingAudioBlob(false);
      };

      audioPlayerRef.current = audio;
      setActivePlayId(recId);
    } catch (err: any) {
      showToast(err.message, "error");
      setLoadingAudioBlob(false);
    }
  };

  const handleAddExternalFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extFile) return;
    setAddingExternal(true);
    await mutations.handleAddExternalFile(
      extTitle, extFile, extScenarioId, extAgentId, extDuration, agentsList
    );
    setAddingExternal(false);
    setShowAddExternal(false);
    setExtTitle('');
    setExtScenarioId('');
    setExtAgentId('');
    setExtFile(null);
  };

  const handleLinkRecordingCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingRecId) return;
    const rec = recordings.find(r => r.id === linkingRecId);
    await mutations.handleLinkRecordingCredentials(
      linkingRecId, linkingAgentId, linkingScenarioId, agentsList, !!rec?.isUploaded
    );
    setLinkingRecId(null);
  };

  return (
    <RecordingDashboardTabRender
      {...props}
      records={filteredRecords}
      agentsList={agentsList}
      
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      
      showAddExternal={showAddExternal}
      setShowAddExternal={setShowAddExternal}
      extTitle={extTitle}
      setExtTitle={setExtTitle}
      extScenarioId={extScenarioId}
      setExtScenarioId={setExtScenarioId}
      extAgentId={extAgentId}
      setExtAgentId={setExtAgentId}
      extDuration={extDuration}
      setExtDuration={setExtDuration}
      extFile={extFile}
      setExtFile={setExtFile}
      addingExternal={addingExternal}
      
      linkingRecId={linkingRecId}
      setLinkingRecId={setLinkingRecId}
      linkingAgentId={linkingAgentId}
      setLinkingAgentId={setLinkingAgentId}
      linkingScenarioId={linkingScenarioId}
      setLinkingScenarioId={setLinkingScenarioId}
      
      activePlayId={activePlayId}
      isPlaying={isPlaying}
      loadingAudioBlob={loadingAudioBlob}
      
      isUploading={mutations.isUploading}
      handlePlayRecording={handlePlayRecording}
      handleUploadToCloud={mutations.handleUploadToCloud}
      handleAddExternalFile={handleAddExternalFileSubmit}
      handleLinkRecordingCredentials={handleLinkRecordingCredentialsSubmit}
      handleDeleteLocalRecord={mutations.handleDeleteLocalRecord}
      onSelectRecording={onViewDetails}
    />
  );
}
