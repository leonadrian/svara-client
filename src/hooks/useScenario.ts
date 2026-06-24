import { useState, useEffect, FormEvent } from 'react';
import { 
  UserProfile,
  BusinessScenario, 
  ScenarioPoint, 
  ScenarioSentence, 
  AgentSentence, 
  CustomerSentence, 
  ScenarioCategory, 
  CustomerResponseCategory 
} from '../types/index';
import { useServices } from '../services/ServiceContext';

// --- 1. Scenario Builder Hook ---
interface UseScenarioBuilderOptions {
  userId: string;
  editingScenario?: BusinessScenario | null;
  userRole?: string;
  onSaveSuccess: (scenario: BusinessScenario) => void;
  onClose: () => void;
}

export function useScenarioBuilder({
  userId,
  editingScenario,
  userRole,
  onSaveSuccess,
  onClose
}: UseScenarioBuilderOptions) {
  const { userService, scenarioService } = useServices();
  const [title, setTitle] = useState(editingScenario?.title || '');
  const [category, setCategory] = useState<ScenarioCategory>(editingScenario?.category || 'sales');
  const [description, setDescription] = useState(editingScenario?.description || '');
  
  // Sentences using ScenarioSentence directly
  const [sentences, setSentences] = useState<ScenarioSentence[]>(() => {
    if (editingScenario && editingScenario.sentences && editingScenario.sentences.length > 0) {
      return [...editingScenario.sentences];
    }
    return [];
  });

  // State arrays for scenario points with stable generated IDs
  const [mandatoryPoints, setMandatoryPoints] = useState<{ pointId: string; pointName: string }[]>(() => {
    if (editingScenario && editingScenario.scenarioPoints) {
      return editingScenario.scenarioPoints
        .filter(p => p.pointType === 'mandatory')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }));
    }
    return [];
  });

  const [sellingPoints, setSellingPoints] = useState<{ pointId: string; pointName: string }[]>(() => {
    if (editingScenario && editingScenario.scenarioPoints) {
      return editingScenario.scenarioPoints
        .filter(p => p.pointType === 'key_point')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }));
    }
    return [];
  });

  const [qualificationCriteria, setQualificationCriteria] = useState<{ pointId: string; pointName: string }[]>(() => {
    if (editingScenario && editingScenario.scenarioPoints) {
      return editingScenario.scenarioPoints
        .filter(p => p.pointType === 'qualification')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }));
    }
    return [];
  });

  // Consolidated inputs state to reduce duplication
  const [inputs, setInputs] = useState({
    mandatory: '',
    selling: '',
    qualification: ''
  });

  // Dynamically compile available points and IDs based on the states
  const allAvailablePoints = [
    ...mandatoryPoints.map((pt) => ({ id: pt.pointId, name: pt.pointName, type: 'mandatory' })),
    ...sellingPoints.map((pt) => ({ id: pt.pointId, name: pt.pointName, type: 'key_point' })),
    ...qualificationCriteria.map((pt) => ({ id: pt.pointId, name: pt.pointName, type: 'qualification' })),
  ];

  // New sentence form state
  const [newSpeaker, setNewSpeaker] = useState<'customer' | 'agent'>('customer');
  const [newText, setNewText] = useState('');
  const [newIntent, setNewIntent] = useState(''); 
  const [newResponseType, setNewResponseType] = useState<CustomerResponseCategory>('general'); 
  const [newSelectedPointIds, setNewSelectedPointIds] = useState<string[]>([]); 

  const [newPreface, setNewPreface] = useState('');
  const [newPostscript, setNewPostscript] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trainer list states
  const [trainers, setTrainers] = useState<UserProfile[]>([]);
  const [loadingTrainers, setLoadingTrainers] = useState(false);
  const [allowedTrainers, setAllowedTrainers] = useState<string[]>(editingScenario?.allowedTrainers || []);

  // For editing within lines
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSpeaker, setEditSpeaker] = useState<'agent' | 'customer'>('agent');
  const [editText, setEditText] = useState('');
  const [editIntent, setEditIntent] = useState('');
  const [editResponseType, setEditResponseType] = useState<CustomerResponseCategory>('general');
  const [editSelectedPointIds, setEditSelectedPointIds] = useState<string[]>([]);

  const [editPreface, setEditPreface] = useState('');
  const [editPostscript, setEditPostscript] = useState('');

  const [isTemplateActive, setIsTemplateActive] = useState(false);

  const loadTemplate = (base: BusinessScenario) => {
    setTitle(`${base.title} (Salinan)`);
    setCategory(base.category);
    setDescription(base.description);
    
    // Copy checklist points
    setMandatoryPoints(
      base.scenarioPoints
        .filter(p => p.pointType === 'mandatory')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }))
    );
    setSellingPoints(
      base.scenarioPoints
        .filter(p => p.pointType === 'key_point')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }))
    );
    setQualificationCriteria(
      base.scenarioPoints
        .filter(p => p.pointType === 'qualification')
        .map(p => ({ pointId: p.pointId, pointName: p.pointName }))
    );

    // Copy sentences
    setSentences(base.sentences.map(sen => ({
      ...sen,
      scenarioId: ''
    })));

    setIsTemplateActive(true);
  };

  useEffect(() => {
    if (userRole !== 'manager') return;

    let isMounted = true;
    setLoadingTrainers(true);

    const fetchTrainers = async () => {
      try {
        const users = await userService.getUsers();
        if (isMounted) {
          const list = users.filter((u) => u.role === 'trainer');
          setTrainers(list);
        }
      } catch (e) {
        if (isMounted) {
          console.error("Error loading trainers: ", e);
        }
      } finally {
        if (isMounted) {
          setLoadingTrainers(false);
        }
      }
    };

    fetchTrainers();

    return () => {
      isMounted = false;
    };
  }, [userRole, userService]);

  // Sentence Handlers
  const addSentence = () => {
    if (!newText.trim()) return;

    const sentenceId = `sen_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    let newSentence: ScenarioSentence;
    if (newSpeaker === 'agent') {
      newSentence = {
        sentenceId,
        scenarioId: editingScenario?.scenarioId || '',
        sequence: sentences.length + 1,
        speaker: 'agent',
        text: newText.trim(),
        intentIds: newIntent.trim() ? [newIntent.trim()] : [],
        scenarioPointIds: [...newSelectedPointIds],
        preface: newPreface.trim() ? newPreface.trim() : undefined,
        postscript: newPostscript.trim() ? newPostscript.trim() : undefined
      } as AgentSentence;
    } else {
      newSentence = {
        sentenceId,
        scenarioId: editingScenario?.scenarioId || '',
        sequence: sentences.length + 1,
        speaker: 'customer',
        text: newText.trim(),
        responseType: newResponseType,
        preface: newPreface.trim() ? newPreface.trim() : undefined,
        postscript: newPostscript.trim() ? newPostscript.trim() : undefined
      } as CustomerSentence;
    }

    setSentences([...sentences, newSentence]);
    setNewText('');
    setNewIntent('');
    setNewSelectedPointIds([]);
    setNewPreface('');
    setNewPostscript('');
    setNewSpeaker(newSpeaker === 'customer' ? 'agent' : 'customer');
  };

  const removeSentence = (index: number) => {
    const updated = sentences.filter((_, i) => i !== index).map((sen, idx) => ({
      ...sen,
      sequence: idx + 1
    }));
    setSentences(updated);
  };

  const moveSentence = (index: number, direction: 'up' | 'down') => {
    const newSentences = [...sentences];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSentences.length) return;
    
    [newSentences[index], newSentences[targetIdx]] = [newSentences[targetIdx], newSentences[index]];
    
    const finalSentences = newSentences.map((sen, idx) => ({
      ...sen,
      sequence: idx + 1
    }));
    
    setSentences(finalSentences);
  };

  const startEditingSentence = (index: number, sen: ScenarioSentence) => {
    setEditingIndex(index);
    setEditSpeaker(sen.speaker);
    setEditText(sen.text);
    setEditPreface(sen.preface || '');
    setEditPostscript(sen.postscript || '');
    if (sen.speaker === 'agent') {
      setEditIntent(sen.intentIds?.[0] || '');
      setEditResponseType('general');
      setEditSelectedPointIds((sen as AgentSentence).scenarioPointIds || []);
    } else {
      setEditIntent('');
      setEditResponseType(sen.responseType || 'general');
      setEditSelectedPointIds([]);
    }
  };

  const saveEditSentence = () => {
    if (editingIndex === null || !editText.trim()) return;

    const updated = [...sentences];
    const target = updated[editingIndex];

    if (editSpeaker === 'agent') {
      updated[editingIndex] = {
        ...target,
        speaker: 'agent',
        text: editText.trim(),
        preface: editPreface.trim() ? editPreface.trim() : undefined,
        postscript: editPostscript.trim() ? editPostscript.trim() : undefined,
        intentIds: editIntent.trim() ? [editIntent.trim()] : [],
        scenarioPointIds: [...editSelectedPointIds]
      } as AgentSentence;
    } else {
      updated[editingIndex] = {
        ...target,
        speaker: 'customer',
        text: editText.trim(),
        preface: editPreface.trim() ? editPreface.trim() : undefined,
        postscript: editPostscript.trim() ? editPostscript.trim() : undefined,
        responseType: editResponseType
      } as CustomerSentence;
    }

    setSentences(updated);
    setEditingIndex(null);
  };

  // Checklist adding (using stable UUID-like format instead of indexes)
  const addMandatoryPoint = () => {
    if (!inputs.mandatory.trim()) return;
    const pointId = `pt_m_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setMandatoryPoints([...mandatoryPoints, { pointId, pointName: inputs.mandatory.trim() }]);
    setInputs(prev => ({ ...prev, mandatory: '' }));
  };

  const removeMandatoryPoint = (pointId: string) => {
    setMandatoryPoints(mandatoryPoints.filter((p) => p.pointId !== pointId));
    setSentences(sentences.map(sen => {
      if (sen.speaker === 'agent') {
        const agSen = sen as AgentSentence;
        return {
          ...agSen,
          scenarioPointIds: (agSen.scenarioPointIds || []).filter(id => id !== pointId)
        } as AgentSentence;
      }
      return sen;
    }));
  };

  const addSellingPoint = () => {
    if (!inputs.selling.trim()) return;
    const pointId = `pt_s_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setSellingPoints([...sellingPoints, { pointId, pointName: inputs.selling.trim() }]);
    setInputs(prev => ({ ...prev, selling: '' }));
  };

  const removeSellingPoint = (pointId: string) => {
    setSellingPoints(sellingPoints.filter((p) => p.pointId !== pointId));
    setSentences(sentences.map(sen => {
      if (sen.speaker === 'agent') {
        const agSen = sen as AgentSentence;
        return {
          ...agSen,
          scenarioPointIds: (agSen.scenarioPointIds || []).filter(id => id !== pointId)
        } as AgentSentence;
      }
      return sen;
    }));
  };

  const addQualification = () => {
    if (!inputs.qualification.trim()) return;
    const pointId = `pt_q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setQualificationCriteria([...qualificationCriteria, { pointId, pointName: inputs.qualification.trim() }]);
    setInputs(prev => ({ ...prev, qualification: '' }));
  };

  const removeQualification = (pointId: string) => {
    setQualificationCriteria(qualificationCriteria.filter((p) => p.pointId !== pointId));
    setSentences(sentences.map(sen => {
      if (sen.speaker === 'agent') {
        const agSen = sen as AgentSentence;
        return {
          ...agSen,
          scenarioPointIds: (agSen.scenarioPointIds || []).filter(id => id !== pointId)
        } as AgentSentence;
      }
      return sen;
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError("Judul dan Deskripsi skenarios wajib diisi");
      return;
    }
    if (sentences.length === 0) {
      setError("Masukkan setidaknya 1 kalimat percakapan dalam skrip skenario");
      return;
    }
    if (mandatoryPoints.length === 0) {
      setError("Masukkan setidaknya 1 Poin Kepatuhan Kritis (Mandatory Points)");
      return;
    }

    setSubmitting(true);
    const id = editingScenario?.scenarioId || `scenario_${Date.now()}`;

    // Map points using stable pointId objects
    const scenarioPoints: ScenarioPoint[] = [
      ...mandatoryPoints.map((p) => ({
        pointId: p.pointId,
        scenarioId: id,
        pointType: 'mandatory' as const,
        pointName: p.pointName
      })),
      ...sellingPoints.map((p) => ({
        pointId: p.pointId,
        scenarioId: id,
        pointType: 'key_point' as const,
        pointName: p.pointName
      })),
      ...qualificationCriteria.map((p) => ({
        pointId: p.pointId,
        scenarioId: id,
        pointType: 'qualification' as const,
        pointName: p.pointName
      }))
    ];

    const finalSentences: ScenarioSentence[] = sentences.map((sen, index) => {
      if (sen.speaker === 'agent') {
        return {
          ...sen,
          scenarioId: id,
          sequence: index + 1
        } as AgentSentence;
      } else {
        return {
          ...sen,
          scenarioId: id,
          sequence: index + 1
        } as CustomerSentence;
      }
    });

    const businessScenario: BusinessScenario = {
      scenarioId: id,
      category,
      title: title.trim(),
      description: description.trim(),
      scenarioPoints,
      sentences: finalSentences,
      createdBy: editingScenario?.createdBy || userId,
      createdAt: editingScenario?.createdAt || new Date().toISOString(),
      allowedTrainers: userRole === 'manager' ? allowedTrainers : (editingScenario?.allowedTrainers || []),
      allowedAgents: editingScenario?.allowedAgents || []
    };

    try {
      await scenarioService.createScenario(id, businessScenario);
      onSaveSuccess(businessScenario);
      onClose();
    } catch (err: any) {
      console.error("Failed to write scenario via ScenarioBuilder: ", err);
      setError("Gagal menyimpan skenario ke database: " + err.message);
      setSubmitting(false);
    }
  };

  return {
    title,
    setTitle,
    category,
    setCategory,
    description,
    setDescription,
    sentences,
    setSentences,
    mandatoryPoints,
    sellingPoints,
    qualificationCriteria,
    inputs,
    setInputs,
    allAvailablePoints,
    newSpeaker,
    setNewSpeaker,
    newText,
    setNewText,
    newIntent,
    setNewIntent,
    newResponseType,
    setNewResponseType,
    newSelectedPointIds,
    setNewSelectedPointIds,
    submitting,
    error,
    setError,
    trainers,
    loadingTrainers,
    allowedTrainers,
    setAllowedTrainers,
    editingIndex,
    setEditingIndex,
    editSpeaker,
    setEditSpeaker,
    editText,
    setEditText,
    editIntent,
    setEditIntent,
    editResponseType,
    setEditResponseType,
    editSelectedPointIds,
    setEditSelectedPointIds,
    newPreface,
    setNewPreface,
    newPostscript,
    setNewPostscript,
    editPreface,
    setEditPreface,
    editPostscript,
    setEditPostscript,
    addSentence,
    removeSentence,
    moveSentence,
    startEditingSentence,
    saveEditSentence,
    addMandatoryPoint,
    removeMandatoryPoint,
    addSellingPoint,
    removeSellingPoint,
    addQualification,
    removeQualification,
    isTemplateActive,
    loadTemplate,
    handleSubmit
  };
}

// --- 2. Scenario Viewer Hook ---
interface UseScenarioViewerOptions {
  scenarios: BusinessScenario[];
}

export function useScenarioViewer({ scenarios }: UseScenarioViewerOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sales' | 'verification'>('all');

  const filteredScenarios = scenarios.filter((sc) => {
    const matchesSearch = 
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sc.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || sc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredScenarios
  };
}
