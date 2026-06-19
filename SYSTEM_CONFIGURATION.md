# Dokumen Cetak Biru: Arsitektur Konfigurasi Sistem Dinamis (Superadmin Control Panel)

Dokumen ini menjelaskan rancangan teknis, skema data, dan model integrasi state global untuk **Sistem Konfigurasi Dinamis** di Svara. Fitur ini dirancang khusus untuk memfasilitasi **Superadmin** dalam mengontrol, menonaktifkan, atau mengaktifkan rangkaian bauran fitur translasi audio (seperti memilih mode rekam murni vs. transkripsi, mengatur waktu transkripsi real-time vs. pasca-sesi, dan memilih model AI lokal vs. cloud di dalam framework OmniVoice Scribe) secara terpusat.

Dengan membatasi kendali mutlak ini hanya di tangan Superadmin, kita menjamin **konsistensi standardisasi data** yang dikumpulkan oleh sistem, melindungi keandalan database, serta mengisolasi agen dan trainer dari kompleksitas pengaturan taktis selama masa bimbingan.

---

## 1. Filosofi & Batasan Hak Akses (RBAC)

Svara menerapkan segmentasi peran yang sangar rigid melalui sistem **Role-Based Access Control (RBAC)**:

```
                  +----------------------------------------------+
                  |         [ DATABASE CONFIGS STORE ]           |
                  +----------------------+-----------------------+
                                         |
                                         v
                  +----------------------------------------------+
                  |           [ Role Authorization ]             |
                  +----------------------+-----------------------+
                                         |
             +---------------------------+---------------------------+
             |                                                       |
             v (Grup Hak Akses: WRITE)                              v (Grup Hak Akses: READ-ONLY)
+------------------------+                              +------------------------+
|    [ PERAN: SUPERADMIN ] |                              |     [ PERAN: TRAINER ] |
|  - Ubah Pipeline Mode  |                              |  - Baca Config At Boot |
|  - Ganti Engine/Model  |                              |  - Evaluasi Berdasarkan |
|  - Uji Fitur Kasar     |                              |    Standar Config Terkait|
+------------------------+                              +------------------------+
             |                                                       |
             | (Publikasikan Perubahan ke Sesi Mandiri)              v (Grup Hak Akses: READ-ONLY)
             v                                          +------------------------+
+-------------------------------------------------------+    [ PERAN: AGENT ]    |
|               [ LIVE SIMULATION SESSION ]             |  - Baca Config At Boot |
|  Membaca instruksi config tetap saat boot-up sesi     |  - Antarmuka Mengikuti |
|  - Menjamin data ter-capture seragam & konsisten      |    Bauran Konfigurasi  |
+-------------------------------------------------------+------------------------+
```

### Aturan Konsistensi Data:
1. **Immutable during Session**: Sesi latihan yang sedang berjalan mengambil status snapshot konfigurasi pada saat tombol "Mulai Latihan" ditekan. Perubahan konfigurasi oleh Superadmin di tengah-tengah latihan tidak akan memandulkan sesi instan tersebut guna menghindari kegagalan penyimpanan.
2. **Hidden Control Panel**: Seluruh antarmuka kontrol konfigurasi terisolasi fungsional di balik rute khusus superadmin (`/superadmin/settings`) dan dibersihkan dari DOM pohon render kustomer/trainer reguler untuk keamanan fungsional.

---

## 2. Struktur Skema Data Konfigurasi (`SystemConfiguration`)

Konfigurasi didesain dengan format dokumen skema tunggal (*Single Document Pattern*) yang disimpan di dalam database Firebase Firestore (koleksi `system_settings` dengan ID dokumen `voice_pipeline_config`):

```typescript
export interface SystemConfiguration {
  id: string;
  updatedAt: string;
  updatedBy: string;

  // 1. Core Pipeline Switch
  audioPipelineMode: "RECORD_ONLY" | "RECORD_WITH_TRANSCRIPTION";

  // 2. Transcription Timing Switch
  transcriptionTiming: "REALTIME_ONLY" | "POST_SESSION_ONLY" | "BOTH_REALTIME_AND_POST";

  // 3. Modul Real-Time (On-Premises LOCAL only via OmniVoice Scribe)
  realtimeConfig: {
    engine: "OMNIVOICE_SCRIBE" | "DISABLED";
    modelName: "cahya/faster-whisper-medium-id" | string;
    connectionEndpoint: string; // Alamat WS, misal: ws://192.168.1.100:8000/ws/stream
    fuzzyMatchThreshold: number; // Toleransi keserupaan string, default: 0.75 (0-1.0)
  };

  // 4. Modul Post-Session / Batch Evaluator (OMNIVOICE SCRIBE Switch)
  postSessionConfig: {
    engine: "OMNIVOICE_SCRIBE_LOCAL" | "OMNIVOICE_SCRIBE_CLOUD";
    modelName: 
      | "cahya/whisper-large-id"         // OmniVoice Scribe Local Option
      | "gemini-2.5-pro"                // OmniVoice Scribe Cloud Option
      | "gemini-2.5-flash"              // OmniVoice Scribe Cloud Option
      | "claude-3-5-sonnet"             // OmniVoice Scribe Cloud Option
      | "gpt-4o";                       // OmniVoice Scribe Cloud Option
    endpointUrl: string; // HTTP Rest API route, misal: http://192.168.1.100:8000/api/transcribe-full
    enableSentiment: boolean;
    enableDiarization: boolean;
  };

  // 5. Feature Flag Registry (Guna pelepasan fitur kasar secara terkontrol)
  featureFlags: {
    enableAcousticFeedback: boolean;   // Uji coba feedback intonasi (Kasar)
    enableFillerWordsDetection: boolean; // Pendeteksi kata jeda emm/anu (Kasar)
    enableInteractivePrompterGlow: boolean; // Transisi animasi glow prompter
  };
}
```

---

## 3. Aliran Integrasi State Global: `SystemConfigProvider` (React)

Untuk mendistribusikan konfigurasi ini secara anggun (*graceful*) ke seluruh komponen React, akan dibuat React Context khusus berpelindung fallback luring (*offline fallback*):

```typescript
import React, { createContext, useContext, useState, useEffect } from "react";
import { SystemConfiguration } from "./types";

interface SystemConfigContextType {
  config: SystemConfiguration;
  isLoading: boolean;
  error: string | null;
  updateConfig: (newConfig: Partial<SystemConfiguration>) => Promise<boolean>;
}

// Default Parameter Fallback jika database gagal diraih (Aman & Bebas Crash)
export const DEFAULT_OFFLINE_CONFIG: SystemConfiguration = {
  id: "default_fallback",
  updatedAt: new Date().toISOString(),
  updatedBy: "SYSTEM_OFFLINE_FALLBACK",
  audioPipelineMode: "RECORD_ONLY", // Default teraman: Rekam reguler tanpa transkripsi
  transcriptionTiming: "POST_SESSION_ONLY",
  realtimeConfig: {
    engine: "DISABLED",
    modelName: "cahya/faster-whisper-medium-id",
    connectionEndpoint: "ws://localhost:8000/ws/stream",
    fuzzyMatchThreshold: 0.75
  },
  postSessionConfig: {
    engine: "OMNIVOICE_SCRIBE_CLOUD",
    modelName: "gemini-2.5-flash",
    endpointUrl: "/api/v1/cloud/transcribe-full",
    enableSentiment: false,
    enableDiarization: false
  },
  featureFlags: {
    enableAcousticFeedback: false,
    enableFillerWordsDetection: false,
    enableInteractivePrompterGlow: true
  }
};

const SystemConfigContext = createContext<SystemConfigContextType | undefined>(undefined);
```

---

## 4. Kasus Pratinjau Interaksi Pipeline Dinamis (Behavior Matrix)

Bauran konfigurasi di atas memicu modifikasi antarmuka dan perilaku perutean data secara real-time pada simulator roleplay:

### A. Skenario 1: `audioPipelineMode === "RECORD_ONLY"`
*   **Perilaku UI Simulator**:
    1. Tombol visual diatur murni hanya untuk merekam audio. Panel asisten prompter real-time disembunyikan sepenuhnya dari layar.
    2. Sinyal audio dari mikrofon disalurkan 100% lurus ke kelas `AudioRecorderService`.
    3. Setelah merekam selesai (`stopRecording`), berkas audio biner utuh diamankan ke pangkalan cache luring pelanggan (IndexedDB) dan diunggah ke cloud storage. Trainer melakukan evaluasi secara manual.

### B. Skenario 2: `transcriptionTiming === "POST_SESSION_ONLY"`
*   **Perilaku UI Simulator**:
    1. Pengalaman latihan berjalan tradisional tanpa bisikan prompter real-time di layar.
    2. Sinyal audio dari mikrofon disalurkan ke kelas `AudioRecorderService`.
    3. Setelah merekam selesai (`stopRecording`), berkas audio dikirim ke adapter pilihan Superadmin (OmniVoice Scribe Local / OmniVoice Scribe Cloud). Setelah pemrosesan batch tuntas, halaman penilaian dipenuhi secara otomatis oleh hasil transkripsi dan segmentasi AI, termasuk skor kualitas auditori digital.

### C. Skenario 3: `transcriptionTiming === "BOTH_REALTIME_AND_POST"`
*   **Perilaku UI Simulator**:
    1. Menjalankan mikrofon dua aliran: `AudioRecorderService` mengarsip file luring (IndexedDB), sementara `AudioTranscriberService` mengalirkan chunk data secara paralel ke port WS **OmniVoice Scribe**.
    2. Kotak prompter aktif memunculkan teks transkrip instan dan membubuhkan centang otomatis asinkron pada naskah yang berhasil diucapkan oleh agen.
    3. Setelah sesi usai, transkripsi utuh yang sempurna diperoleh kembali dengan presisi maksimal.

---

## 5. Antarmuka Panel Kontrol Superadmin (Visual Mockup)

Panel kontrol dirancang minimalis dan pragmatis untuk memberikan visualisasi instan yang aman bagi Superadmin:

```
===================================================================================
  SVARA SYSTEM COGNITIVE CONTROL PANEL                              [SUPERADMIN]
===================================================================================

  [X] AKTIFKAN INTEGRASI SPEECH-TO-TEXT (STT) PIPELINE
  -------------------------------------------------------------
  Pilih Mode Operasional Evaluasi:
  ( ) Rekam Audio Saja (Misi Kritis On-Premises)
  ( ) Transkripsi & Evaluasi Hanya di Akhir Sesi Latihan (Hemat Resource)
  (*) Aktifkan Keduanya (Interaktif Prompter Real-time + Evaluasi Akhir Sesi) [REKOMENDASI]

  1. PENGATURAN PROMPTER REAL-TIME (LOCAL ONLY)
  -------------------------------------------------------------
  Diberdayakan oleh Framework: OmniVoice Scribe (On-Premises Runtime)
  Port Koneksi WS  : [ ws://192.168.1.100:8000/ws/stream    ]  [TES KONEKSI]
  Model Bahasa (ID): [ cahya/faster-whisper-medium-id (FP16)]
  Toleransi Cocok  : [ - - - - - - - * - - ] 0.75 (Fuzzy Threshold)

  2. PENGATURAN EVALUATOR AKHIR (BATCH POST-PROCESSING)
  -------------------------------------------------------------
  Modul Pemrosesan : (*) OmniVoice Scribe Cloud (Sangat Cerdas) 
                     ( ) OmniVoice Scribe Local (Bebas Biaya)
  Provider Pilihan : [ GOOGLE_GEMINI (Multimodal Mode)      ]
  Model Akustik    : [ gemini-2.5-pro                       ]
  Gunakan Analisis : [X] Analisis Sentimen   [X] Segmentasi Speaker (Diarization)

  3. REGISTER FITUR EKSPERIMENTAL (FITUR KASAR / BETA)
  -------------------------------------------------------------
  [ ] Deteksi Nada Bicara & Kecepatan Bicara Agen (Acoustic Feedback) [BETA]
  [X] Analisis Frekuensi Kata Jeda (Filler Words "emm, anu, dsb") [BETA]
  [X] Efek Animasi Transisi Menyala Prompter Interaktif 

===================================================================================
                                                        [ SIMPAN KONFIGURASI ]
```

Dengan blueprint arsitektur konfigurasi yang kokoh ini, Superadmin dapat menjinakkan pelepasan fitur AI baru di ekosistem Svara secara presisi dan aman!
