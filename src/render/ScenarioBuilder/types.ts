import React from 'react';
import {
  Sparkles, Check, MessageSquare, Shield, Save, Edit2, PlayCircle
} from 'lucide-react';
import {
  BusinessScenario,
  ScenarioSentence,
  CustomerResponseCategory,
  UserProfile,
} from '../../types/index';

// ============================================================
// Label / Config Interfaces
// ============================================================

/** Reusable config for a single form field (label + input/textarea/select) */
export interface FormFieldConfig {
  label: string;
  placeholder?: string;
  emptyText?: string;
}

/** Reusable config for a checklist card (mandatory / key points / qualification) */
export interface ChecklistLabels {
  title: string;
  description: string;
  placeholder: string;
  emptyText: string;
  colorScheme: 'red' | 'rose' | 'teal';
}

// --- Header ---
export interface HeaderLabels {
  titleNew: string;
  titleEdit: string;
  titleReadOnly: string;
  icon: React.ReactNode;
}

// --- Core Info (title + category + description) ---
export interface CoreInfoLabels {
  title: FormFieldConfig;
  category: FormFieldConfig & {
    salesOption: string;
    verificationOption: string;
  };
  description: FormFieldConfig;
}

// --- Trainer Access ---
export interface TrainerAccessLabels {
  sectionTitle: string;
  sectionDescription: string;
  icon: React.ReactNode;
  loadingText: string;
  emptyText: string;
}

// --- Evaluation (wrapper for 3 checklists) ---
export interface EvaluationLabels {
  sectionTitle: string;
  sectionDescription: string;
  icon: React.ReactNode;
  mandatory: ChecklistLabels;
  keyPoints: ChecklistLabels;
  qualification: ChecklistLabels;
}

// --- Script Builder ---
export interface ScriptBuilderLabels {
  sectionTitle: string;
  sectionDescription: string;
  sectionDescriptionReadOnly: string;
  icon: React.ReactNode;
  emptyStateText: string;
  addSectionTitle: string;
  speakerLabel: string;
  customerOption: string;
  agentOption: string;
  intentLabel: string;
  intentPlaceholder: string;
  responseLabel: string;
  responseOptions: { general: string; objection: string; question: string };
  scriptTextLabel: string;
  scriptTextPlaceholder: string;
  addButtonText: string;
  pointSelectionTitle: string;
  pointSelectionTitleEdit: string;
  saveEditText: string;
  cancelEditText: string;
  pointHintText: string;
  speakerBadgeCustomer: string;
  speakerBadgeAgent: string;
}

// --- Footer ---
export interface FooterLabels {
  cancelText: string;
  backToCatalogText: string;
  editScenarioText: string;
  startRoleplayText: string;
  saveText: string;
  savingText: string;
  editIcon: React.ReactNode;
  roleplayIcon: React.ReactNode;
  saveIcon: React.ReactNode;
}

// --- Master Config ---
export interface ScenarioBuilderLabels {
  header: HeaderLabels;
  coreInfo: CoreInfoLabels;
  trainerAccess: TrainerAccessLabels;
  evaluation: EvaluationLabels;
  scriptBuilder: ScriptBuilderLabels;
  footer: FooterLabels;
}

// ============================================================
// DEFAULT LABELS (Bahasa Indonesia)
// ============================================================

export const DEFAULT_LABELS: ScenarioBuilderLabels = {
  header: {
    titleNew: 'Buat Skenario Latihan Baru',
    titleEdit: 'Edit Skenario Latihan (Builder)',
    titleReadOnly: 'Detail Skenario Latihan',
    icon: React.createElement(Sparkles, { className: 'h-5 w-5 text-indigo-600' }),
  },

  coreInfo: {
    title: {
      label: 'Judul Skenario',
      placeholder: 'misal: Penawaran Kartu Kredit Platinum Svara Bank',
    },
    category: {
      label: 'Kategori Pelayanan',
      salesOption: '🎯 Sales & Telesales',
      verificationOption: '🛡️ Pengecekan & Verifikasi',
    },
    description: {
      label: 'Deskripsi Kontekstual Skenario',
      placeholder: 'Berikan info dasar mengenai profil nasabah, tujuan penelponan, rintangan dasar, dsb.',
      emptyText: 'Tidak ada deskripsi.',
    },
  },

  trainerAccess: {
    sectionTitle: 'Pengaturan Keamanan Akses Trainer',
    sectionDescription: 'Tentukan trainer mana saja yang diperbolehkan melatih menggunakan skenario buatan Anda ini. Trainer bimbingan yang tidak dicentang tidak akan dapat melihat atau menggunakannya di dashboard mereka.',
    icon: React.createElement(Shield, { className: 'h-4 w-4 text-indigo-600' }),
    loadingText: 'Memuat daftar trainer...',
    emptyText: 'Belum ada akun trainer terdaftar.',
  },

  evaluation: {
    sectionTitle: 'Kriteria Penilaian & Evaluasi Percakapan',
    sectionDescription: 'Tentukan metrik checklist kepatuhan yang harus dinilai secara otomatis oleh Svara AI Evaluator. Setelah ini dibuat, Anda bisa mengaitkannya dengan baris skrip Agen di atas.',
    icon: React.createElement(Check, { className: 'h-4 w-4 text-indigo-650 border border-indigo-200 bg-indigo-50 rounded-md box-content p-1' }),
    mandatory: {
      title: '🗣️ Poin Kepatuhan Kritis (Mandatory)',
      description: 'Hal-hal yang WAJIB disebutkan Agen (misal: verifikasi nama, sapaan hangat, dsb.).',
      placeholder: 'misal: Sebutkan nama instansi perusahaan',
      emptyText: 'Belum ada poin kritis.',
      colorScheme: 'red',
    },
    keyPoints: {
      title: '⭐ Poin Penyampaian Kunci (Key Points / USP)',
      description: 'Nilai promosi atau nilai jual utama produk yang sebaiknya dipromosikan.',
      placeholder: 'misal: Promo cashback 10% di e-commerce',
      emptyText: 'Belum ada poin kunci.',
      colorScheme: 'rose',
    },
    qualification: {
      title: '📋 Syarat Kualifikasi Calon Debitur / Nasabah',
      description: 'Informasi kelayakan yang wajib dicocokan atau dikonfirmasi dengan nasabah.',
      placeholder: 'misal: Penghasilan minimum Rp 5juta per bulan',
      emptyText: 'Belum ada syarat kualifikasi.',
      colorScheme: 'teal',
    },
  },

  scriptBuilder: {
    sectionTitle: 'Rangkaian Skrip Percakapan Nasabah & Agent',
    sectionDescription: 'Buat skrip panduan model percakapan percabangan. Anda bisa mengaitkan setiap kalimat ucapan Agen dengan parameter \'Scenario Points\' kritis agar Agen tahu wadah penyampaian yang tepat.',
    sectionDescriptionReadOnly: 'Tinjau model rangkaian percakapan dialog panduan untuk Agen dan Nasabah.',
    icon: React.createElement(MessageSquare, { className: 'h-4 w-5 text-indigo-650' }),
    emptyStateText: 'Belum ada baris skrip percakapan. Silakan tambahkan baris di bawah beralur tanya jawab.',
    addSectionTitle: 'Tambah Baris Skrip Baru',
    speakerLabel: 'Pengucap (Speaker)',
    customerOption: '🙋‍♂️ Nasabah (Customer)',
    agentOption: '🎧 Agen (Agent)',
    intentLabel: 'Intensi/Tujuan Ucapan Agen',
    intentPlaceholder: 'misal: Verifikasi Alamat, Menjelaskan Promo',
    responseLabel: 'Kategori Respons Nasabah',
    responseOptions: {
      general: 'Umum / Respons Tanya Jawab Biasa',
      objection: 'Keberatan / Keberatan Aturan (Objection)',
      question: 'Pertanyaan Kritis / Ingin Tahu Lebih',
    },
    scriptTextLabel: 'Teks Ucapan Skrip Percakapan',
    scriptTextPlaceholder: 'Ketik teks percakapan yang harus diucapkan di sini...',
    addButtonText: 'Tambahkan ke Skrip',
    pointSelectionTitle: 'Hubungkan Kalimat Dialog Ini Dengan Parameter Penilaian (Scenario Point)',
    pointSelectionTitleEdit: 'Pilih Parameter Penilaian Terkait untuk Kalimat Ini',
    saveEditText: 'Simpan Perubahan',
    cancelEditText: 'Batal',
    pointHintText: 'Harus mengandung poin:',
    speakerBadgeCustomer: 'Nasabah',
    speakerBadgeAgent: 'Agen',
  },

  footer: {
    cancelText: 'Batal',
    backToCatalogText: 'Kembali ke Katalog',
    editScenarioText: 'Edit Skenario',
    startRoleplayText: 'Mulai Simulasi Roleplay',
    saveText: 'Simpan Skenario',
    savingText: 'Menyimpan Skenario...',
    editIcon: React.createElement(Edit2, { className: 'h-3.5 w-3.5' }),
    roleplayIcon: React.createElement(PlayCircle, { className: 'h-4 w-4' }),
    saveIcon: React.createElement(Save, { className: 'h-4 w-4 text-white shrink-0' }),
  },
};

// ============================================================
// Utility: deep merge partial labels with defaults
// ============================================================

export function mergeLabels(overrides?: Partial<ScenarioBuilderLabels>): ScenarioBuilderLabels {
  if (!overrides) return DEFAULT_LABELS;

  return {
    header: { ...DEFAULT_LABELS.header, ...overrides.header },
    coreInfo: {
      ...DEFAULT_LABELS.coreInfo,
      ...overrides.coreInfo,
      title: { ...DEFAULT_LABELS.coreInfo.title, ...overrides.coreInfo?.title },
      category: { ...DEFAULT_LABELS.coreInfo.category, ...overrides.coreInfo?.category },
      description: { ...DEFAULT_LABELS.coreInfo.description, ...overrides.coreInfo?.description },
    },
    trainerAccess: { ...DEFAULT_LABELS.trainerAccess, ...overrides.trainerAccess },
    evaluation: {
      ...DEFAULT_LABELS.evaluation,
      ...overrides.evaluation,
      mandatory: { ...DEFAULT_LABELS.evaluation.mandatory, ...overrides.evaluation?.mandatory },
      keyPoints: { ...DEFAULT_LABELS.evaluation.keyPoints, ...overrides.evaluation?.keyPoints },
      qualification: { ...DEFAULT_LABELS.evaluation.qualification, ...overrides.evaluation?.qualification },
    },
    scriptBuilder: {
      ...DEFAULT_LABELS.scriptBuilder,
      ...overrides.scriptBuilder,
      responseOptions: { ...DEFAULT_LABELS.scriptBuilder.responseOptions, ...overrides.scriptBuilder?.responseOptions },
    },
    footer: { ...DEFAULT_LABELS.footer, ...overrides.footer },
  };
}

// ============================================================
// Main Component Props
// ============================================================

export interface ScenarioBuilderRenderProps {
  userId: string;
  onClose: () => void;
  editingScenario?: BusinessScenario | null;
  userRole?: string;
  isReadOnly?: boolean;
  onStartRoleplay?: () => void;
  onEditScenario?: () => void;
  title: string;
  setTitle: (value: string) => void;
  category: 'sales' | 'verification';
  setCategory: (value: 'sales' | 'verification') => void;
  description: string;
  setDescription: (value: string) => void;
  sentences: ScenarioSentence[];
  mandatoryPoints: { pointId: string; pointName: string }[];
  sellingPoints: { pointId: string; pointName: string }[];
  qualificationCriteria: { pointId: string; pointName: string }[];
  inputs: { mandatory: string; selling: string; qualification: string };
  setInputs: React.Dispatch<React.SetStateAction<{ mandatory: string; selling: string; qualification: string }>>;
  allAvailablePoints: { id: string; name: string; type: string }[];
  newSpeaker: 'customer' | 'agent';
  setNewSpeaker: (value: 'customer' | 'agent') => void;
  newText: string;
  setNewText: (value: string) => void;
  newIntent: string;
  setNewIntent: (value: string) => void;
  newResponseType: CustomerResponseCategory;
  setNewResponseType: (value: CustomerResponseCategory) => void;
  newSelectedPointIds: string[];
  setNewSelectedPointIds: (value: string[]) => void;
  submitting: boolean;
  error: string | null;
  trainers: UserProfile[];
  loadingTrainers: boolean;
  allowedTrainers: string[];
  setAllowedTrainers: (value: string[]) => void;
  editingIndex: number | null;
  setEditingIndex: (value: number | null) => void;
  editSpeaker: 'agent' | 'customer';
  setEditSpeaker: (value: 'agent' | 'customer') => void;
  editText: string;
  setEditText: (value: string) => void;
  editIntent: string;
  setEditIntent: (value: string) => void;
  editResponseType: CustomerResponseCategory;
  setEditResponseType: (value: CustomerResponseCategory) => void;
  editSelectedPointIds: string[];
  setEditSelectedPointIds: (value: string[]) => void;
  addSentence: () => void;
  removeSentence: (index: number) => void;
  moveSentence: (index: number, direction: 'up' | 'down') => void;
  startEditingSentence: (index: number, sen: ScenarioSentence) => void;
  saveEditSentence: () => void;
  addMandatoryPoint: () => void;
  removeMandatoryPoint: (pointId: string) => void;
  addSellingPoint: () => void;
  removeSellingPoint: (pointId: string) => void;
  addQualification: () => void;
  removeQualification: (pointId: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  /** Optional label overrides for customising text/icons per section */
  labels?: Partial<ScenarioBuilderLabels>;
  scenarios?: BusinessScenario[];
  loadTemplate: (base: BusinessScenario) => void;
  isTemplateActive: boolean;
  newPreface: string;
  setNewPreface: (value: string) => void;
  newPostscript: string;
  setNewPostscript: (value: string) => void;
  editPreface: string;
  setEditPreface: (value: string) => void;
  editPostscript: string;
  setEditPostscript: (value: string) => void;
}
