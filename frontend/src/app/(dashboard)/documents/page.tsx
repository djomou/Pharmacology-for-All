'use client';
import { useState } from 'react';
import { FileText, Search, Image, BookOpen } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { drugsApi } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function DocumentsPage() {
  const [productId, setProductId] = useState('');
  const [loading,   setLoading]   = useState(false);

  return (
    <div className="page-enter">
      <Header title="Documents & Médias" subtitle="Notices, images et recommandations officielles" />
      <div className="px-8 py-6 space-y-6">
        <div className="glass rounded-2xl p-6 gold-border">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-gold-400" />
            <h3 className="font-display font-semibold text-white">Rechercher par médicament</h3>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="number" value={productId} onChange={e => setProductId(e.target.value)}
                placeholder="ID du médicament"
                className="input-dark w-full pl-11 pr-4 py-3 rounded-xl text-sm" />
            </div>
            <button className="btn-gold px-6 py-3 rounded-xl font-medium text-sm flex items-center gap-2">
              <Search size={16} /> Rechercher
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: FileText, label: 'Notices', desc: 'Documents officiels AMM', color: '#D4A853' },
            { icon: Image,    label: 'Images',  desc: 'Visuels des médicaments', color: '#38BCD4' },
            { icon: BookOpen, label: 'Recommandations', desc: 'Reco officielles HAS', color: '#4ADE80' },
          ].map((item, i) => (
            <div key={i} className="stat-card flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <div>
                <p className="font-semibold text-white">{item.label}</p>
                <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
