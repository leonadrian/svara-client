import React from 'react';
import { UserProfile } from '../../types/index';
import { Shield, Sparkles, Target, Trophy } from 'lucide-react';

interface DashboardHeroProps {
  userProfile: UserProfile;
}

export function DashboardHero({ userProfile }: DashboardHeroProps) {
  const { role, userName } = userProfile;
  const firstName = userName.split(' ')[0];

  const getRoleContent = () => {
    switch (role) {
      case 'superadmin':
        return {
          title: 'Sistem Terpusat Svara',
          subtitle: 'Kendalikan seluruh ekosistem, akses sistem, dan data platform dari satu titik pusat.',
          icon: <Shield className="h-10 w-10 text-indigo-400" />,
          gradient: 'from-indigo-900 via-indigo-800 to-slate-900',
          accent: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30'
        };
      case 'manager':
        return {
          title: 'Ruang Kendali Manager',
          subtitle: 'Pantau performa agensi, setujui pengguna baru, dan analisis efektivitas simulasi secara holistik.',
          icon: <Target className="h-10 w-10 text-rose-400" />,
          gradient: 'from-rose-900 via-rose-800 to-slate-900',
          accent: 'bg-rose-500/20 text-rose-200 border-rose-500/30'
        };
      case 'trainer':
        return {
          title: 'Portal Pelatih Agen',
          subtitle: 'Rancang skenario simulasi, tugaskan ke agen bimbingan Anda, dan berikan evaluasi mendalam.',
          icon: <Sparkles className="h-10 w-10 text-blue-400" />,
          gradient: 'from-blue-900 via-blue-800 to-slate-900',
          accent: 'bg-blue-500/20 text-blue-200 border-blue-500/30'
        };
      case 'agent':
      default:
        return {
          title: 'Simulator Agen AI',
          subtitle: 'Asah kemampuan komunikasi Anda melalui simulasi skenario bisnis yang interaktif dengan AI.',
          icon: <Trophy className="h-10 w-10 text-emerald-400" />,
          gradient: 'from-emerald-900 via-emerald-800 to-slate-900',
          accent: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
        };
    }
  };

  const content = getRoleContent();

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${content.gradient} shadow-lg mb-6 border border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700`}>
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 px-8 py-10 sm:px-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${content.accent} backdrop-blur-sm`}>
            {role} Svara Platform
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            Selamat datang, {firstName}!
          </h1>
          
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        <div className="hidden md:flex shrink-0 items-center justify-center w-24 h-24 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl rotate-3 hover:rotate-0 transition-all duration-300">
          {content.icon}
        </div>
      </div>
    </div>
  );
}
