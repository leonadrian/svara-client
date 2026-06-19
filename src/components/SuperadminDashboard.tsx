import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types/index';
import { showToast } from '../utils';
import { useServices } from '../services/ServiceContext';
import { 
  Users, UserCheck, ShieldAlert, Sparkles, Search, UserX, Edit3, 
  Trash2, Send, CheckCircle, RefreshCw, X, Shield, Settings 
} from 'lucide-react';

interface SuperadminDashboardProps {
  userProfile: UserProfile;
}

export default function SuperadminDashboard({ userProfile }: SuperadminDashboardProps) {
  const { userService } = useServices();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Edit User modal state
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('agent');
  const [editTrainerId, setEditTrainerId] = useState('');
  const [editManagerId, setEditManagerId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = userService.subscribeUserList((list) => {
      setUsers(list);
      setLoading(false);
    }, (err) => {
      console.error("Gagal menyinkronkan daftar pengguna:", err);
      setError("Gagal memuat pengguna dari database cloud.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApproveUser = async (user: UserProfile) => {
    try {
      await userService.updateUser(user.userId, { 
        role: 'agent',
        updatedAt: new Date().toISOString()
      });
      showToast(`Pengguna "${user.userName}" berhasil disetujui sebagai Agen!`, 'success');
    } catch (err: any) {
      showToast(`Gagal menyetujui kualifikasi: ${err.message}`, 'error');
    }
  };

  const handleDeactivateUser = async (user: UserProfile) => {
    try {
      await userService.updateUser(user.userId, { 
        role: 'onboarding',
        updatedAt: new Date().toISOString()
      });
      showToast(`Akses pengguna "${user.userName}" berhasil dicabut (Atur kembali ke onboarding)!`, 'info');
    } catch (err: any) {
      showToast(`Gagal mencabut akses pengguna: ${err.message}`, 'error');
    }
  };

  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    const now = new Date().toISOString();
    const updates: any = {
      userName: editName.trim(),
      role: editRole,
      assignedTrainer: editRole === 'agent' ? (editTrainerId || null) : null,
      assignedManager: (editRole === 'agent' || editRole === 'trainer') ? (editManagerId || null) : null,
      updatedAt: now
    };

    try {
      await userService.updateUser(editingUser.userId, updates);
      showToast(`Profil "${editName}" berhasil disimpan ke Cloud!`, 'success');
      setEditingUser(null);
    } catch (err: any) {
      showToast(`Gagal menyimpan perubahan: ${err.message}`, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter users based on query and filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.userId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Basic counters
  const totalUsersCount = users.length;
  const pendingUsersCount = users.filter(u => u.role === 'onboarding').length;
  const trainerUsersCount = users.filter(u => u.role === 'trainer').length;
  const agentUsersCount = users.filter(u => u.role === 'agent').length;

  return (
    <div className="space-y-6" id="superadmin-dashboard">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 shadow-lg border border-slate-700/35">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-indigo-500/20 rounded-md font-mono text-[9px] uppercase tracking-widest font-extrabold text-indigo-300">SYSTEM ROOT</span>
              <span className="text-[11px] text-slate-300 font-bold uppercase tracking-widest">• Superadmin Dashboard</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display leading-tight">Selamat Datang, Superadmin {userProfile.userName}!</h2>
            <p className="text-slate-400 text-xs max-w-xl leading-relaxed font-semibold">
              Gunakan panel ini untuk mengelola hak akses seluruh pengguna Svara, mendeaktivasi akun, serta menyetujui pendaftaran profil baru secara instant.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="bg-slate-800/45 p-3 rounded-2xl border border-slate-700/50">
              <span className="text-slate-400 block text-[9px] font-black uppercase tracking-wider mb-0.5">Total User</span>
              <span className="text-xl font-bold font-mono text-white">{totalUsersCount}</span>
            </div>
            <div className="bg-orange-950/40 p-3 rounded-2xl border border-orange-500/20">
              <span className="text-orange-400 block text-[9px] font-black uppercase tracking-wider mb-0.5">Menunggu (Onboarding)</span>
              <span className="text-xl font-bold font-mono text-white">{pendingUsersCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Filter Bars */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3.5">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari pengguna berdasarkan nama, email, atau ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Peran:</span>
              <select
                className="p-1.5 px-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
              >
                <option value="all">Semua Peran</option>
                <option value="onboarding">⏳ Onboarding (Pending)</option>
                <option value="superadmin">👑 Superadmin</option>
                <option value="manager">🏢 Manager</option>
                <option value="trainer">🎓 Trainer</option>
                <option value="agent">🎧 Agent</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden text-left bg-white/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-black text-slate-400 uppercase tracking-wider">
                <th className="p-4 pl-6">Profil Pengguna</th>
                <th className="p-4">Peran Sistem</th>
                <th className="p-4">Pembimbing & Atasan</th>
                <th className="p-4 pr-6 text-right">Tindakan Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-705">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Sinkronisasi database pengguna...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada pengguna yang cocok dengan kriteria filter.</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xxs ${
                          user.role === 'superadmin' ? 'bg-indigo-100 text-indigo-700' :
                          user.role === 'manager' ? 'bg-rose-100 text-rose-700' :
                          user.role === 'trainer' ? 'bg-blue-100 text-blue-700' : 
                          user.role === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.userName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-900 block font-display leading-tight">{user.userName}</span>
                          <span className="text-[10px] text-slate-400 font-mono select-all block leading-normal">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        user.role === 'superadmin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' :
                        user.role === 'manager' ? 'bg-rose-50 text-rose-700 border border-rose-150' :
                        user.role === 'trainer' ? 'bg-blue-50 text-blue-700 border border-blue-150' :
                        user.role === 'onboarding' ? 'bg-amber-50 text-amber-700 border border-amber-150 animate-pulse' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-150'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-505">
                      {user.role === 'agent' ? (
                        <div className="flex flex-col gap-0.5">
                          <span>Trainer: <strong className="text-slate-800">{user.assignedTrainer || 'Belum Ditentukan'}</strong></span>
                          <span>Manager: <strong className="text-slate-800">{user.assignedManager || 'Belum Ditentukan'}</strong></span>
                        </div>
                      ) : user.role === 'trainer' ? (
                        <span>Manager: <strong className="text-slate-800">{user.assignedManager || 'Belum Ditentukan'}</strong></span>
                      ) : (
                        <span className="text-slate-400 block">-</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {user.role === 'onboarding' && (
                          <button
                            type="button"
                            onClick={() => handleApproveUser(user)}
                            className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer shadow-xxs"
                            title="Setujui Profil Ini"
                          >
                            Setujui
                          </button>
                        )}
                        {user.role !== 'onboarding' && user.role !== 'superadmin' && (
                          <button
                            type="button"
                            onClick={() => handleDeactivateUser(user)}
                            className="py-1 px-2.5 border border-slate-200 hover:bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer font-bold bg-white"
                            title="Cabut Akses (pindah ke onboarding)"
                          >
                            Cabut Akses
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(user);
                            setEditName(user.userName);
                            setEditRole(user.role);
                            setEditTrainerId((user as any).assignedTrainer || '');
                            setEditManagerId((user as any).assignedManager || '');
                          }}
                          className="p-1 border border-slate-200 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg cursor-pointer bg-white"
                          title="Edit User Detail"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Details popup Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-xs flex items-center justify-center p-4 text-left">
          <form 
            onSubmit={handleSaveUserEdit}
            className="bg-white border border-slate-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden animate-fade-in"
          >
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-black font-display tracking-tight flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Kelola Akun Svara</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono select-all">ID: {editingUser.userId}</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Peran Sistem</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold focus:outline-none"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="onboarding">⏳ Onboarding (Pending)</option>
                  <option value="superadmin">👑 Superadmin</option>
                  <option value="manager">🏢 Manager</option>
                  <option value="trainer">🎓 Trainer</option>
                  <option value="agent">🎧 Agent</option>
                </select>
              </div>

              {editRole === 'agent' && (
                <div className="space-y-3 animate-fade-in text-left border-t border-slate-100 pt-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">ID Trainer Pembimbing</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
                      value={editTrainerId}
                      onChange={(e) => setEditTrainerId(e.target.value)}
                    >
                      <option value="">-- Tanpa Trainer Pembimbing --</option>
                      {users.filter(u => u.role === 'trainer' || u.role === 'superadmin').map(trainer => (
                        <option key={trainer.userId} value={trainer.userId}>{trainer.userName} ({trainer.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">ID Manager Pembimbing</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
                      value={editManagerId}
                      onChange={(e) => setEditManagerId(e.target.value)}
                    >
                      <option value="">-- Tanpa Manager Atasan --</option>
                      {users.filter(u => u.role === 'manager' || u.role === 'superadmin').map(manager => (
                        <option key={manager.userId} value={manager.userId}>{manager.userName} ({manager.email})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {editRole === 'trainer' && (
                <div className="space-y-1.5 animate-fade-in text-left border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">ID Manager Pembimbing</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 text-xs font-bold"
                    value={editManagerId}
                    onChange={(e) => setEditManagerId(e.target.value)}
                  >
                    <option value="">-- Tanpa Manager Atasan --</option>
                    {users.filter(u => u.role === 'manager' || u.role === 'superadmin').map(manager => (
                      <option key={manager.userId} value={manager.userId}>{manager.userName} ({manager.email})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold cursor-pointer text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
