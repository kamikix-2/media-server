import React from 'react';
import { Laptop } from '../types';
import { LaptopCard } from './LaptopCard';
import { Heart } from 'lucide-react';

interface FavoritesViewProps {
  favoriteLaptops: Laptop[];
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenHistory: (laptop: Laptop) => void;
  onOpenAlert: (laptop: Laptop) => void;
  onGoToDeals: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteLaptops,
  comparedIds,
  onToggleCompare,
  onToggleFavorite,
  onOpenHistory,
  onOpenAlert,
  onGoToDeals,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Portátiles Favoritos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Los modelos que has guardado para seguimiento continuado en tiendas online.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
          {favoriteLaptops.length} guardados
        </span>
      </div>

      {favoriteLaptops.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Aún no has guardado favoritos</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Pulsa el icono del corazón en cualquiera de los portátiles para tenerlos a mano y sincronizarlos con la nube.
          </p>
          <button
            onClick={onGoToDeals}
            className="mt-2 px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            Explorar ofertas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteLaptops.map((laptop) => (
            <LaptopCard
              key={laptop.id}
              laptop={laptop}
              isCompared={comparedIds.includes(laptop.id)}
              isFavorite={true}
              onToggleCompare={onToggleCompare}
              onToggleFavorite={onToggleFavorite}
              onOpenHistory={onOpenHistory}
              onOpenAlert={onOpenAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
};
