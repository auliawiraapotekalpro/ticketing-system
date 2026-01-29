
import React, { useState } from 'react';
import { Ticket, TicketStatus, RiskLevel } from '../types';
import { Send, CheckCircle2, AlertCircle, Calendar, User, Building, ShieldAlert, FileSearch, X, ImageIcon, ChevronDown, ListFilter, ZoomIn, ExternalLink, PartyPopper, CheckCircle, Save, Briefcase } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  onUpdateTicket: (id: string, updates: Partial<Ticket>, isFinished?: boolean) => void;
  adminName: string;
}

const DEPARTMENTS = ["SITEDEV", "GA", "SEPTIAN", "HENDRI", "AREA MANAGER"];

const AdminDashboard: React.FC<Props> = ({ tickets, onUpdateTicket, adminName }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPlanSuccessModal, setShowPlanSuccessModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [viewingPhotos, setViewingPhotos] = useState<string[] | null>(null);
  
  // Local state untuk menampung input sementara di tiap baris
  const [editingRows, setEditingRows] = useState<Record<string, any>>({});

  const getDirectDriveLink = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    let id = '';
    if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    else if (url.includes('/file/d/')) id = url.split('/file/d/')[1].split('/')[0];
    return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
  };

  const handleInputChange = (ticketId: string, field: string, value: string) => {
    setEditingRows(prev => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || {}),
        [field]: value,
        picName: adminName // Selalu update PIC dengan user login
      }
    }));
  };

  const handleSavePlan = (ticketId: string) => {
    const updates = editingRows[ticketId];
    if (!updates?.department || !updates?.plannedDate || !updates?.targetEndDate) {
      alert("Harap lengkapi Departemen, Rencana Tanggal, dan Target Selesai!");
      return;
    }
    onUpdateTicket(ticketId, updates, false);
    setShowPlanSuccessModal(true);
  };

  const handleFinishAction = (ticketId: string) => {
    onUpdateTicket(ticketId, {}, true);
    setShowSuccessModal(true);
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> PENDING</div>;
      case TicketStatus.PLANNED:
        return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-wider"><Calendar size={12} /> SCHEDULED</div>;
      case TicketStatus.FINISHED:
        return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> FINISHED</div>;
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.CRITICAL: return <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-extrabold rounded uppercase">P1 - CRITICAL</span>;
      case RiskLevel.HIGH: return <span className="px-2 py-1 bg-orange-100 text-orange-600 text-[10px] font-extrabold rounded uppercase">P2 - HIGH</span>;
      case RiskLevel.MEDIUM: return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-extrabold rounded uppercase">P3 - MEDIUM</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-extrabold rounded uppercase">LOW</span>;
    }
  };

  const filteredTickets = statusFilter === 'ALL' ? tickets : tickets.filter(t => t.status === statusFilter);

  // Clock component untuk badge status
  const Clock = ({ size }: { size: number }) => <AlertCircle size={size} />;

  return (
    <div className="space-y-8 max-w-full mx-auto relative px-4">
      {/* MODAL SUKSES UPDATE RENCANA */}
      {showPlanSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPlanSuccessModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Rencana Disimpan!</h3>
            <p className="text-slate-500 font-medium mb-8 text-sm">Status tiket berubah menjadi SCHEDULED. Notifikasi email telah dikirim ke outlet.</p>
            <button onClick={() => setShowPlanSuccessModal(false)} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest">Oke</button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES PEKERJAAN SELESAI */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Tiket Selesai!</h3>
            <p className="text-slate-500 font-medium mb-8 text-sm">Pekerjaan telah dinyatakan FINISHED. Laporan ditutup secara permanen.</p>
            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg hover:bg-emerald-700 transition-all uppercase tracking-widest">Selesai</button>
          </div>
        </div>
      )}

      {/* Modal Foto Preview */}
      {viewingPhotos && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" onClick={() => setViewingPhotos(null)}></div>
          <div className="relative bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full animate-in zoom-in-95 shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Bukti Foto Dokumentasi</h3>
              <button onClick={() => setViewingPhotos(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              {viewingPhotos.map((src, i) => (
                <img key={i} src={getDirectDriveLink(src)} className="w-full rounded-2xl border border-slate-200 shadow-md" alt="Bukti" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex justify-center flex-wrap gap-4">
        {['ALL', TicketStatus.PENDING, TicketStatus.PLANNED, TicketStatus.FINISHED].map(f => (
          <button key={f} onClick={() => setStatusFilter(f as any)} className={`px-6 py-2.5 rounded-full border text-[10px] font-black uppercase transition-all ${statusFilter === f ? 'bg-slate-800 text-white shadow-md border-slate-800' : 'bg-white text-slate-500 hover:border-slate-300'}`}>
            {f === 'PLANNED' ? 'SCHEDULED' : f === 'FINISHED' ? 'FINISHED' : f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[2100px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-6">ID TIKET</th>
              <th className="px-6 py-6">STATUS</th>
              <th className="px-6 py-6">TOKO</th>
              <th className="px-6 py-6 w-80">INDIKATOR</th>
              <th className="px-6 py-6">RESIKO</th>
              <th className="px-6 py-6">FOTO</th>
              <th className="px-6 py-6 w-56">DEPARTEMENT</th>
              <th className="px-6 py-6">PIC (AUTO)</th>
              <th className="px-6 py-6">RENCANA TGL</th>
              <th className="px-6 py-6">TARGET SELESAI</th>
              <th className="px-6 py-6 text-center">AKSI ADMIN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-20 text-center text-slate-400 font-bold italic">Tidak ada tiket dalam kategori ini.</td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                const rowData = editingRows[t.id] || {};
                const isFinished = t.status === TicketStatus.FINISHED;
                
                return (
                  <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${isFinished ? 'opacity-70' : ''}`}>
                    <td className="px-6 py-8 font-bold text-[#5a56e9] text-sm uppercase">{t.id}</td>
                    <td className="px-6 py-8">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-8 font-bold text-slate-800 text-sm uppercase">{t.storeName}</td>
                    <td className="px-6 py-8 text-slate-600 text-sm leading-relaxed">{t.problemIndicator}</td>
                    <td className="px-6 py-8">{getRiskBadge(t.riskLevel)}</td>
                    <td className="px-6 py-8">
                      {t.photos.length > 0 && (
                        <button onClick={() => setViewingPhotos(t.photos)} className="p-3 bg-indigo-50 text-[#5a56e9] rounded-xl hover:bg-indigo-100 transition-colors">
                          <ImageIcon size={18} />
                        </button>
                      )}
                    </td>
                    
                    {/* INPUT DEPARTEMENT */}
                    <td className="px-6 py-8">
                      <select 
                        disabled={isFinished}
                        value={rowData.department || t.department || ""}
                        onChange={(e) => handleInputChange(t.id, 'department', e.target.value)}
                        className="w-full px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#5a56e9]/10 outline-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Pilih --</option>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>

                    {/* AUTO PIC */}
                    <td className="px-6 py-8">
                      <div className="px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-400 uppercase tracking-wider text-center flex items-center gap-2 justify-center">
                        <User size={12} /> {t.picName || adminName}
                      </div>
                    </td>

                    {/* INPUT RENCANA TANGGAL */}
                    <td className="px-6 py-8">
                      <input 
                        type="date"
                        disabled={isFinished}
                        value={rowData.plannedDate || t.plannedDate || ""}
                        onChange={(e) => handleInputChange(t.id, 'plannedDate', e.target.value)}
                        className="px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#5a56e9]/10 disabled:bg-slate-50"
                      />
                    </td>

                    {/* INPUT TARGET SELESAI */}
                    <td className="px-6 py-8">
                      <input 
                        type="date"
                        disabled={isFinished}
                        value={rowData.targetEndDate || t.targetEndDate || ""}
                        onChange={(e) => handleInputChange(t.id, 'targetEndDate', e.target.value)}
                        className="px-3 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-[#5a56e9]/10 disabled:bg-slate-50"
                      />
                    </td>

                    {/* BUTTON AKSI */}
                    <td className="px-6 py-8">
                      <div className="flex items-center gap-2 justify-center">
                        {!isFinished ? (
                          <>
                            <button 
                              onClick={() => handleSavePlan(t.id)}
                              className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white text-[10px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-md uppercase tracking-wider"
                              title="Update Rencana"
                            >
                              <Save size={14} /> Update Rencana
                            </button>
                            <button 
                              onClick={() => handleFinishAction(t.id)}
                              className="flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md uppercase tracking-wider"
                              title="Pengerjaan Selesai"
                            >
                              <CheckCircle size={14} /> Selesai
                            </button>
                          </>
                        ) : (
                          <div className="text-emerald-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={14} /> Terverifikasi Selesai
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
