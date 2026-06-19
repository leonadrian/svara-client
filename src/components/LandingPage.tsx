import React from 'react';
import { UserProfile } from '../types/index';
import { PlayCircle, Mic, Shield } from 'lucide-react';
import { useAuthResolver } from '../hooks/useAuthResolver';
import { useOnboardingForm } from '../hooks/useOnboardingForm';

interface OnboardingProps {
  onProfileSynced: (profile: UserProfile | null) => void;
}

export default function LandingPage({ onProfileSynced }: OnboardingProps) {
  const {
    currentUser,
    loading,
    showOnboarding,
    error,
    setError,
    handleGoogleSignIn,
  } = useAuthResolver({ onProfileSynced });

  const {
    name,
    setName,
    submitting,
    handleOnboardingSubmit,
  } = useOnboardingForm({
    currentUser,
    onProfileSynced,
    onError: setError,
    initialName: currentUser?.displayName || '',
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6" id="svara-loading-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Sinkronisasi sistem Svara...</p>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12" id="svara-onboarding-screen">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-xl rounded-2xl p-8 transition-all">
          <div className="flex flex-col items-center mb-6">
            <div className="p-3 rounded-2xl mb-3 bg-brand-50 text-brand-600">
              <Mic className="h-8 w-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold font-display text-gray-900 tracking-tight text-center">
              Pendaftaran Profil Svara
            </h2>
            <p className="text-gray-500 text-sm mt-1 text-center leading-relaxed">
              Hubungkan profil Svara Anda ke database pusat. Akun akan diaudit & disetujui secara manual oleh Superadmin.
            </p>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-750 mb-1.5">Nama Lengkap</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-gray-900 focus:outline-hidden"
                placeholder="Andi Saputra atau Budi Pratama"
                required
              />
            </div>



            <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl text-xs text-slate-500 leading-relaxed">
              <span className="font-bold text-slate-700 block mb-1">Informasi Hak Akses:</span>
              Demi menjaga privasi log latihan dan skenario per divisi, Anda akan terdaftar sebagai <strong className="text-slate-700">Pending Agent</strong>. Superadmin akan memberikan akses dan peran formal (Manager/Trainer/Agent) setelah pendaftaran Anda masuk ke antrean administrator.
            </div>

            {error && (
              <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl p-3" id="onboarding-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-5 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-brand-600 hover:bg-brand-700 shadow-brand-500/10"
              id="submit-onboarding-btn"
            >
              {submitting ? 'Menyimpan...' : 'Kirim Permintaan Pendaftaran'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-emerald-50/30 lg:flex-row" id="svara-auth-screen">
      {/* Design Side Panel */}
      <div className="relative flex flex-col justify-between bg-radial from-slate-900 to-zinc-950 p-8 text-white lg:w-1/2 min-h-[40vh] lg:min-h-screen">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 flex items-center justify-center bg-brand-600 rounded-xl">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold font-display tracking-tight hover:text-brand-500 transition-all cursor-pointer">Svara</span>
        </div>

        <div className="my-auto py-12 max-w-lg">
          <h1 className="text-3xl lg:text-5xl font-extrabold font-display leading-tight tracking-tight text-white mb-6">
            Latih Komunikasi Telepon Anda Secara Profesional
          </h1>
          <p className="text-gray-400 font-sans text-lg mb-8 leading-relaxed">
            Platform simulasi roleplay berbasis skenario bisnis nyata. Latih keterampilan negosiasi, sales, dan kepatuhan dalam alur pelatihan interaktif yang terstruktur.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-white/10 rounded-lg text-brand-400 mt-1">
                <PlayCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Skenario Terstruktur</h4>
                <p className="text-sm text-gray-400">Pilih dari katalog skenario Penjualan (Sales) dan Verifikasi Keamanan.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 bg-white/10 rounded-lg text-brand-400 mt-1">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Perekaman Suara Device-Native</h4>
                <p className="text-sm text-gray-400">Rekam percakapan roleplay secara langsung dan simpan secara aman.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          SVARA • PLATFORM LATIHAN TELEPON
        </div>
      </div>

      {/* Action / Auth Panel */}
      <div className="flex flex-col justify-center items-center p-8 lg:w-1/2 bg-white">
        <div className="w-full max-w-sm flex flex-col justify-center">
          <h2 className="text-3xl font-bold font-display text-gray-900 tracking-tight text-center lg:text-left mb-2">Masuk ke Svara</h2>
          <p className="text-gray-500 text-sm text-center lg:text-left mb-8">Hubungkan akun Anda untuk menyinkronkan aktivitas latihan.</p>

          <div className="space-y-4">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3" id="google-auth-error">
                {error}
              </div>
            )}

            {/* Google Sign-In button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer"
              id="google-login-btn"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.11C18.281 1.09 15.42 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.79-.08-1.4-.25-1.925H12.24z"/>
              </svg>
              <span>Masuk dengan Google</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
