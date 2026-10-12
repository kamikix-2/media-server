import React from 'react';
import { Laptop } from '../types';
import { Scale, ArrowRight, X } from 'lucide-react';

interface ComparisonDockProps {
  comparedLaptops: Laptop[];
  onOpenComparison: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  gamerMode?: boolean;
}

export const ComparisonDock: React.FC<ComparisonDockProps> = ({
  comparedLaptops,
  onOpenComparison,
  onRemove,
  onClear,
  gamerMode = false,
}) => {
  if (comparedLaptops.length === 0) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[92%] sm:w-auto px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200 ${
      gamerMode 
        ? 'bg-[#0f172a] text-white border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)]' 
        : 'bg-slate-900 text-white border border-slate-800'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 ${gamerMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-sky-400'}`}>
          <Scale className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <span>{comparedLaptops.length} portátiles en comparador</span>
            {gamerMode && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-1 rounded">
                GPU MATRIX
              </span>
            )}
          </div>
          <div className={`text-[11px] truncate max-w-[200px] sm:max-w-xs ${gamerMode ? 'text-slate-300' : 'text-slate-400'}`}>
            {comparedLaptops.map(l => l.model.split(' ')[0] + ' ' + l.model.split(' ')[1]).join(', ')}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenComparison}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all inline-flex items-center gap-1 ${
            gamerMode 
              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]' 
              : 'bg-white text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>Comparar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClear}
          className={`p-1.5 rounded-lg transition-colors ${gamerMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
          title="Limpiar comparador"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
