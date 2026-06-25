import React, { useState } from 'react';
import { UserProfile } from '../../types/index';
import { Users, CheckCircle, Trash, Edit2 } from 'lucide-react';

interface UserManagementTableProps {
  users: UserProfile[];
  role: string;
  tabType: 'agents' | 'trainers' | 'approvals';
  trainers?: UserProfile[]; // untuk dropdown assign trainer
  onApprove?: (userId: string, role: 'agent' | 'trainer') => void;
  onReject?: (userId: string) => void;
  onAssignTrainer?: (agentId: string, trainerId: string) => void;
}

export function UserManagementTable({ 
  users, 
  role, 
  tabType, 
  trainers = [], 
  onApprove, 
  onReject, 
  onAssignTrainer 
}: UserManagementTableProps) {
  const [editingTrainerId, setEditingTrainerId] = useState<{ [key: string]: boolean }>({});
  const [selectedTrainerId, setSelectedTrainerId] = useState<{ [key: string]: string }>({});

  if (users.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
        <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700">Tidak ada data</h3>
        <p className="text-xs text-slate-500 mt-1">Daftar pengguna kosong untuk kategori ini.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Pengguna</th>
              <th className="px-6 py-4">Peran</th>
              <th className="px-6 py-4">Kontak / Email</th>
              {tabType === 'agents' && <th className="px-6 py-4">Trainer Pembimbing</th>}
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.userId} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.userName}</div>
                      <div className="text-xs text-slate-500 font-mono">{user.userId.substring(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                    user.role === 'trainer' ? 'bg-indigo-100 text-indigo-700' :
                    user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'onboarding' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                
                {tabType === 'agents' && (
                  <td className="px-6 py-4">
                    {editingTrainerId[user.userId] ? (
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs border-slate-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500"
                          value={selectedTrainerId[user.userId] ?? user.assignedTrainer ?? ''}
                          onChange={(e) => setSelectedTrainerId({ ...selectedTrainerId, [user.userId]: e.target.value })}
                        >
                          <option value="">-- Tanpa Trainer --</option>
                          {trainers.map(t => (
                            <option key={t.userId} value={t.userId}>{t.userName}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (onAssignTrainer) {
                              onAssignTrainer(user.userId, selectedTrainerId[user.userId] ?? '');
                              setEditingTrainerId({ ...editingTrainerId, [user.userId]: false });
                            }
                          }}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700 text-xs">
                          {user.assignedTrainer 
                            ? trainers.find(t => t.userId === user.assignedTrainer)?.userName || 'Trainer Tidak Ditemukan'
                            : <span className="text-slate-400 italic">Belum Di-assign</span>
                          }
                        </span>
                        {(role === 'manager' || role === 'superadmin') && (
                          <button 
                            onClick={() => setEditingTrainerId({ ...editingTrainerId, [user.userId]: true })}
                            className="p-1 text-slate-400 hover:text-brand-600 rounded transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}

                <td className="px-6 py-4 text-right">
                  {tabType === 'approvals' && (role === 'manager' || role === 'superadmin') ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onApprove && onApprove(user.userId, 'agent')}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors border border-emerald-200"
                      >
                        Terima Agent
                      </button>
                      <button
                        onClick={() => onApprove && onApprove(user.userId, 'trainer')}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
                      >
                        Terima Trainer
                      </button>
                      <button
                        onClick={() => onReject && onReject(user.userId)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Tidak ada aksi khusus</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
