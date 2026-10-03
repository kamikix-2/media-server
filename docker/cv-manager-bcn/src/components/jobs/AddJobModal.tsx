import React, { useState } from 'react';
import { JobOffer, PortalSource, Modality } from '../../types';
import { X, Plus, Building2, MapPin, DollarSign, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddOffer: (newOffer: JobOffer) => void;
  defaultCategory?: 'it_tech' | 'administrative' | 'all';
}

export const AddJobModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddOffer,
  defaultCategory = 'it_tech',
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Barcelona');
  const [zone, setZone] = useState('Les Corts');
  const [portal, setPortal] = useState<PortalSource>('infojobs');
  const [salary, setSalary] = useState('');
  const [modality, setModality] = useState<Modality>('hibrido');
  const [contractType, setContractType] = useState<'indefinido' | 'autonomo_b2b' | 'temporal'>('indefinido');
  const [description, setDescription] = useState('');
  const [keySkillsText, setKeySkillsText] = useState('');
  const [url, setUrl] = useState('');
  const [distanceFromLesCorts, setDistanceFromLesCorts] = useState('A 800m (Les Corts)');
  const [targetCategory, setTargetCategory] = useState<'it_tech' | 'administrative' | 'all'>(defaultCategory);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim()) {
      alert('Por favor introduce el puesto y la empresa.');
      return;
    }

    const skills = keySkillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newOffer: JobOffer = {
      id: `job-custom-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      location: location.trim() || 'Barcelona',
      zone: zone.trim() || 'Les Corts',
      portal,
      salary: salary.trim() || 'A convenir',
      modality,
      contractType,
      publishedAt: 'Hoy',
      description: description.trim() || 'Oferta añadida manualmente.',
      keySkills: skills.length > 0 ? skills : ['Gestión', 'Barcelona'],
      url: url.trim() || 'https://www.infojobs.net',
      distanceFromLesCorts: distanceFromLesCorts.trim() || 'Les Corts, Barcelona',
      featured: true,
      targetCategory,
    };

    onAddOffer(newOffer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Añadir Oferta Personalizada</h2>
              <p className="text-[11px] text-slate-500">
                Guarda cualquier oferta encontrada en internet en tu panel unificado
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Puesto / Vacante *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Senior Liferay Developer..."
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Empresa *</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej: CaixaBank, Cuatrecasas..."
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Portal de Origen</label>
              <select
                value={portal}
                onChange={(e) => setPortal(e.target.value as PortalSource)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 bg-white"
              >
                <option value="infojobs">InfoJobs</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="barcelona_activa">Barcelona Activa</option>
                <option value="feina_activa_soc">SOC Feina Activa</option>
                <option value="tecnoempleo">Tecnoempleo</option>
                <option value="directo_empresa">Web Empresa</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Modalidad</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as Modality)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 bg-white"
              >
                <option value="hibrido">Híbrido</option>
                <option value="presencial">Presencial</option>
                <option value="remoto">100% Remoto</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value as any)}
                className="w-full border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-900 bg-white"
              >
                <option value="it_tech">IT / Tecnología</option>
                <option value="administrative">Administrativo</option>
                <option value="all">Todas las áreas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Zona / Barrio en Barcelona</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="Ej: Les Corts, Diagonal, Sants..."
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Salario / Tarifa</label>
              <input
                type="text"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Ej: 45.000€ - 50.000€"
                className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Habilidades / Palabras Clave (separadas por comas)</label>
            <input
              type="text"
              value={keySkillsText}
              onChange={(e) => setKeySkillsText(e.target.value)}
              placeholder="Ej: Liferay, Java, Spring, CAE, Facturación..."
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Enlace Directo / URL de la Oferta</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Descripción Breve</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el puesto, requisitos principales y condiciones..."
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
            >
              Guardar Oferta en el Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
