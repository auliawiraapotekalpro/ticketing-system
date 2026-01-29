
import React, { useState } from 'react';
import { Ticket, RiskLevel, TicketStatus } from '../types';
import { ClipboardList, FileText, CheckCircle2, Clock, Upload, X, Eye, Send, ChevronDown, ImageIcon, AlertCircle, ZoomIn, Building, Info, ArrowRight, Camera, ExternalLink, Store, Calendar, Zap } from 'lucide-react';

interface Props {
  tickets: Ticket[];
  onAddTicket: (ticket: Partial<Ticket>) => void;
  storeName: string;
}

const PROBLEM_MAPPING = [
  {
    indicator: "Plafon roboh di area publik/apoteker, kabel terbakar, atau bocor tepat di atas stok obat mahal/kulkas vaksin.",
    riskLevel: RiskLevel.CRITICAL,
    riskLabel: "P1 - CRITICAL",
    impact: "Operasional berhenti sebagian/total, risiko cedera manusia, kerugian stok masif.",
    recommendation: "Perbaikan darurat sumber kebocoran dan penggantian total plafon yang roboh."
  },
  {
    indicator: "Bocor deras di area gudang/belakang, plafon melandai (tunggu roboh), air masuk ke area penjualan tapi belum mengenai stok.",
    riskLevel: RiskLevel.HIGH,
    riskLabel: "P2 - HIGH",
    impact: "Operasional terganggu, risiko kerusakan aset bangunan meningkat jika dibiarkan >24 jam.",
    recommendation: "Perbaikan atap/pipa segera dan penguatan struktur plafon yang melandai."
  },
  {
    indicator: "Rembesan air ( spotting), plafon berjamur, bocor hanya saat hujan sangat deras, area non-vital (toilet/parkir).",
    riskLevel: RiskLevel.MEDIUM,
    riskLabel: "P3 - MEDIUM",
    impact: "Estetika buruk, kenyamanan pelanggan terganggu, tapi bisnis tetap jalan.",
    recommendation: "Pembersihan jamur, pengecatan ulang, dan penambalan titik rembesan."
  }
];

const OutletDashboard: React.FC<Props> = ({ tickets, onAddTicket, storeName }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'monitor'>('create');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [viewingPhotos, setViewingPhotos] = useState<string[] | null>(null);
  
  const [formData, setFormData] = useState({
    storeName: storeName,
    reportDate: new Date().toISOString().split('T')[0],
    problemIndicator: '',
    riskLevel: RiskLevel.LOW,
    riskLabel: '',
    businessImpact: '',
    recommendation: '',
    photos: [] as string[]
  });

  const getDirectDriveLink = (url: string) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    let id = '';
    if (url.includes('id=')) id = url.split('id=')[1].split('&')[0];
    else if (url.includes('/file/d/')) id = url.split('/file/d/')[1].split('/')[0];
    return id ? `https://lh3.googleusercontent.com/d/${id}` : url;
  };

  const handleIndicatorChange = (val: string) => {
    const match = PROBLEM_MAPPING.find(m => m.indicator === val);
    if (match) {
      setFormData(prev => ({
        ...prev,
        problemIndicator: val,
        riskLevel: match.riskLevel,
        riskLabel: match.riskLabel,
        businessImpact: match.impact,
        recommendation: match.recommendation
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, reader.result as string]
          }));
        };
        reader.readAsDataURL(file as File);
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTicket(formData);
    
    setFormData({
      storeName: storeName,
      reportDate: new Date().toISOString().split('T')[0],
      problemIndicator: '',
      riskLevel: RiskLevel.LOW,
      riskLabel: '',
      businessImpact: '',
      recommendation: '',
      photos: []
    });

    setShowSuccessModal(true);
    // Kita tetap di tab 'create' sebentar sampai user klik tutup modal atau otomatis pindah
  };

  const closeSuccessAndMonitor = () => {
    setShowSuccessModal(false);
    setActiveTab('monitor');
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.PENDING:
        return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-bold uppercase tracking-wider"><Clock size={12} /> PENDING</div>;
      case TicketStatus.PLANNED:
        return <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-bold uppercase tracking-wider"><AlertCircle size={12} /> IN_PROGRESS</div>;
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

  const myTickets = tickets.filter(t => t.storeName === storeName);

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Modal Preview Foto */}
      {viewingPhotos && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md" onClick={() => setViewingPhotos(null)}></div>
          <div className="relative bg-white rounded-[2rem] overflow-hidden max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Bukti Foto Kerusakan</h3>
              </div>
              <button onClick={() => setViewingPhotos(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[75vh] overflow-y-auto">
              {viewingPhotos.map((src, i) => (
                <div key={i} className="group relative">
                  <img src={getDirectDriveLink(src)} className="w-full h-auto min-h-[250px] object-cover rounded-2xl shadow-md border border-slate-200 bg-slate-200" alt={`Preview ${i+1}`} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/600x400?text=Image+Process`; }} />
                  <a href={src.startsWith('data:') ? '#' : src} target="_blank" rel="noreferrer" className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur shadow-lg rounded-xl text-[#5a56e9] opacity-0 group-hover:opacity-100 transition-opacity"><ExternalLink size={18} /></a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUKSES SUBMIT LAPORAN */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeSuccessAndMonitor}></div>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-sm text-center relative z-10 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Laporan Terkirim!</h3>
            <p className="text-slate-500 font-medium mb-8">Data telah berhasil diunggah dan notifikasi email telah dikirim ke petugas.</p>
            <button onClick={closeSuccessAndMonitor} className="w-full py-4 bg-[#5a56e9] text-white font-black rounded-2xl shadow-lg hover:bg-[#4d49d9] transition-all uppercase tracking-widest">Lihat Monitoring</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 flex gap-1">
          <button onClick={() => setActiveTab('create')} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'create' ? 'bg-[#5a56e9] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><ClipboardList size={20} /> Isi Laporan</button>
          <button onClick={() => setActiveTab('monitor')} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'monitor' ? 'bg-[#5a56e9] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Eye size={20} /> Monitoring Tiket</button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Formulir Pelaporan Kerusakan Plafon</h2>
              <p className="text-slate-400 text-sm mt-1">Lengkapi data laporan Anda secara bertahap.</p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              Geser ke kanan untuk analisa <ArrowRight size={14} className="text-[#5a56e9]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar -mx-2 px-2">
              
              {/* SLIDE 0: IDENTITAS (NAMA TOKO & TANGGAL) */}
              <div className="min-w-[320px] md:min-w-[400px] snap-start">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center font-bold text-sm">0</div>
                       <label className="font-bold text-slate-700">Identitas Pelapor</label>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <Store size={12} className="text-[#5a56e9]" /> Nama Toko (Otomatis)
                        </label>
                        <input 
                          type="text" 
                          value={formData.storeName} 
                          disabled 
                          className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-500 text-sm uppercase cursor-not-allowed shadow-inner" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <Calendar size={12} className="text-emerald-500" /> Tanggal Pelaporan
                        </label>
                        <input 
                          type="date" 
                          value={formData.reportDate} 
                          onChange={(e) => setFormData({...formData, reportDate: e.target.value})}
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 text-sm focus:ring-2 focus:ring-[#5a56e9]/10 outline-none transition-all shadow-sm"
                          required
                        />
                      </div>
                    </div>
                 </div>
              </div>

              {/* SLIDE 1: INDIKATOR */}
              <div className="min-w-[320px] md:min-w-[400px] snap-start">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-[#5a56e9] text-white rounded-lg flex items-center justify-center font-bold text-sm">1</div>
                       <label className="font-bold text-slate-700">Indikator Masalah</label>
                    </div>
                    <select 
                      className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#5a56e9]/10 outline-none font-medium text-slate-700 text-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207.5L10%2012.5L15%207.5%22%20stroke%3D%22%2364748B%22%20stroke-width%3D%221.66667%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:18px] bg-[right_15px_center] bg-no-repeat shadow-sm"
                      value={formData.problemIndicator}
                      onChange={(e) => handleIndicatorChange(e.target.value)}
                      required
                    >
                      <option value="" disabled>-- Pilih Indikator --</option>
                      {PROBLEM_MAPPING.map((m, idx) => <option key={idx} value={m.indicator}>{m.indicator}</option>)}
                    </select>
                    <div className="p-3 bg-indigo-50/50 rounded-lg">
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">Pilihan Anda akan menentukan tingkat resiko secara otomatis oleh sistem.</p>
                    </div>
                 </div>
              </div>

              {/* SLIDE 2: UPLOAD FOTO */}
              <div className="min-w-[320px] md:min-w-[400px] snap-start">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 h-full space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-[#5a56e9] text-white rounded-lg flex items-center justify-center font-bold text-sm">2</div>
                       <label className="font-bold text-slate-700">Upload Foto Bukti</label>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-slate-200 border-dashed rounded-2xl bg-white cursor-pointer hover:border-[#5a56e9] transition-all group">
                        <Camera size={20} className="text-slate-400 group-hover:text-[#5a56e9]" />
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Tambah</span>
                        <input type="file" multiple onChange={handleFileChange} className="hidden" accept="image/*" />
                      </label>
                      {formData.photos.map((src, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 group shadow-md animate-in zoom-in-75">
                          <img src={getDirectDriveLink(src)} className="w-full h-full object-cover" alt="Preview" />
                          <button type="button" onClick={() => removePhoto(idx)} className="absolute inset-0 flex items-center justify-center bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

              {/* SLIDE 3: ANALISA (RISK, IMPACT, RECOMMENDATION) */}
              <div className="flex gap-4 snap-start">
                <div className="min-w-[200px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm border-t-4 border-t-[#5a56e9] flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Level Resiko</span>
                  <div className={`px-4 py-2 rounded-xl text-xs font-black text-center ${formData.riskLabel ? 'bg-indigo-50 text-[#5a56e9]' : 'text-slate-300 italic'}`}>
                    {formData.riskLabel || "Menunggu..."}
                  </div>
                </div>
                <div className="min-w-[280px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm border-t-4 border-t-[#5a56e9] flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-4">Dampak Bisnis</span>
                  <p className={`text-xs leading-relaxed font-medium ${formData.businessImpact ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                    {formData.businessImpact || "Pilih indikator untuk melihat dampak..."}
                  </p>
                </div>
                {/* REKOMENDASI TINDAKAN */}
                <div className="min-w-[280px] bg-white border border-slate-100 rounded-3xl p-6 shadow-sm border-t-4 border-t-emerald-500 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Rekomendasi Tindakan</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-bold ${formData.recommendation ? 'text-emerald-700' : 'text-slate-300 italic'}`}>
                    {formData.recommendation || "Rekomendasi teknis akan muncul di sini..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={!formData.problemIndicator || formData.photos.length === 0}
                className="w-full py-5 bg-[#5a56e9] text-white font-black text-base rounded-2xl shadow-xl shadow-[#5a56e9]/20 hover:bg-[#4d49d9] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <Send size={20} /> Submit Laporan Sekarang
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden overflow-x-auto animate-in fade-in slide-in-from-bottom-4">
          <table className="w-full text-left min-w-[1800px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-6">ID TIKET</th>
                <th className="px-6 py-6">STATUS</th>
                <th className="px-6 py-6">TOKO</th>
                <th className="px-6 py-6 w-96">INDIKATOR</th>
                <th className="px-6 py-6">RESIKO</th>
                <th className="px-6 py-6 w-64">DAMPAK</th>
                <th className="px-6 py-6 w-64">REKOMENDASI</th>
                <th className="px-6 py-6">FOTO</th>
                <th className="px-6 py-6">PIC</th>
                <th className="px-6 py-6">RENCANA TGL</th>
                <th className="px-6 py-6">TARGET SELESAI</th>
                <th className="px-6 py-6">TGL SELESAI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {myTickets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-20 text-center text-slate-400 font-bold italic">Belum ada riwayat laporan untuk toko ini.</td>
                </tr>
              ) : (
                myTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-8 font-bold text-[#5a56e9] text-sm">{t.id}</td>
                    <td className="px-6 py-8">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-8 font-bold text-slate-800 text-sm uppercase">{t.storeName}</td>
                    <td className="px-6 py-8 text-slate-600 text-sm">{t.problemIndicator}</td>
                    <td className="px-6 py-8">{getRiskBadge(t.riskLevel)}</td>
                    <td className="px-6 py-8 text-slate-500 text-sm italic">{t.businessImpact}</td>
                    <td className="px-6 py-8 text-slate-600 text-sm font-medium">{t.recommendation}</td>
                    <td className="px-6 py-8">
                      {t.photos.length > 0 && <button onClick={() => setViewingPhotos(t.photos)} className="p-3 bg-indigo-50 text-[#5a56e9] rounded-xl hover:bg-indigo-100 transition-colors"><ImageIcon size={18} /></button>}
                    </td>
                    <td className="px-6 py-8 font-bold text-slate-800 text-sm uppercase">{t.picName || '-'}</td>
                    <td className="px-6 py-8 text-slate-500 text-sm">{t.plannedDate || '-'}</td>
                    <td className="px-6 py-8 font-bold text-slate-800 text-sm">{t.targetEndDate || '-'}</td>
                    <td className="px-6 py-8 text-emerald-600 font-bold text-sm">{t.actualFinishedDate || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutletDashboard;
