import React, { useState, useEffect } from 'react';
import { Candidatura, ApplicationStatus, Modality, PortalSource, InterviewRecord, UserProfileAccount } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Mail,
  Building,
  User,
  DollarSign,
  FileText,
  CheckCircle2,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  candidatura?: Candidatura | null;
  onSave: (candidatura: Candidatura) => void;
  onDelete?: (id: string) => void;
  activeProfile?: UserProfileAccount;
  profiles?: UserProfileAccount[];
}

export const generateUniqueCandidaturaId = (): string => {
  return `cand-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const createEmptyCandidatura = (
  targetProfileId?: string,
  profileCategory?: string
): Candidatura => {
  const isAdministrative = profileCategory === 'administrative';
  return {
    id: generateUniqueCandidaturaId(),
    profileId: targetProfileId || 'profile-david',
    company: '',
    role: '',
    location: 'Barcelona (Les Corts)',
    modality: 'hibrido',
    portalSource: 'infojobs',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'enviada',
    contactPerson: {
      name: '',
      role: '',
      email: '',
      phone: '',
      linkedin: '',
    },
    salaryRange: '',
    salaryDiscussed: '',
    contractModality: 'indiferente',
    jobUrl: '',
    followUpDate: '',
    generalNotes: '',
    interviews: [],
    tags: isAdministrative
      ? ['Gestión Administrativa', 'Documental', 'Barcelona']
      : ['Liferay', 'Java', 'FullStack'],
  };
};

export const CandidaturaModal: React.FC<Props> = ({
  isOpen,
  onClose,
  candidatura,
  onSave,
  onDelete,
  activeProfile,
  profiles = [],
}) => {
  const [formData, setFormData] = useState<Candidatura>(() =>
    candidatura
      ? JSON.parse(JSON.stringify(candidatura))
      : createEmptyCandidatura(activeProfile?.id, activeProfile?.category)
  );
  const [activeTab, setActiveTab] = useState<'info' | 'interviews' | 'notes'>('info');

  // Synchronize formData whenever modal opens or the target candidatura changes
  // This completely eliminates the bug where new candidaturas overwrote existing records!
  useEffect(() => {
    if (isOpen) {
      if (candidatura) {
        // Deep copy of existing candidatura to edit
        setFormData(JSON.parse(JSON.stringify(candidatura)));
      } else {
        // Completely FRESH, independent candidatura with brand new unique ID
        setFormData(createEmptyCandidatura(activeProfile?.id, activeProfile?.category));
      }
      setActiveTab('info');
    }
  }, [isOpen, candidatura, activeProfile?.id, activeProfile?.category]);

  if (!isOpen) return null;

  const isEditing = Boolean(candidatura && candidatura.id);

  const handleAddInterview = () => {
    const newInt: InterviewRecord = {
      id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      round: `Entrevista #${formData.interviews.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      interviewers: '',
      format: 'videollamada',
      platform: 'Microsoft Teams',
      notes: '',
      completed: false,
    };
    setFormData((prev) => ({
      ...prev,
      interviews: [...prev.interviews, newInt],
    }));
  };

  const handleUpdateInterview = (idx: number, field: keyof InterviewRecord, value: any) => {
    setFormData((prev) => {
      const copy = [...prev.interviews];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, interviews: copy };
    });
  };

  const handleDeleteInterview = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      interviews: prev.interviews.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim()) {
      alert('Por favor introduce el nombre de la empresa y el puesto.');
      return;
    }

    // Ensure valid unique ID and assigned profile
    const candidaturaToSave: Candidatura = {
      ...formData,
      id: formData.id || generateUniqueCandidaturaId(),
      profileId: formData.profileId || activeProfile?.id || 'profile-david',
    };

    onSave(candidaturaToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Gestionar Candidatura' : 'Nueva Candidatura Independiente'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                {isEditing ? `ID: ${formData.id.slice(-8)}` : 'Nuevo Registro'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? `Editando registro para "${formData.company || 'empresa'}" sin afectar a otras candidaturas`
                : 'Crea un registro de proceso de selección totalmente independiente'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-4 bg-white text-xs font-medium text-slate-600 gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Información General & Contacto
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'interviews'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Rondas de Entrevista</span>
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-full font-mono text-[10px]">
              {formData.interviews.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Notas y Condiciones
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'info' && (
            <div className="space-y-4">
              {/* Profile Association Selector */}
              <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-lg">
                <label className="font-semibold text-slate-800 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-sky-700" />
                    Perfil Profesional Asociado a esta Candidatura
                  </span>
                  <span className="text-[10px] text-sky-700 font-normal">
                    Cada candidatura se guarda asociada a su perfil
                  </span>
                </label>
                <select
                  value={formData.profileId || activeProfile?.id || 'profile-david'}
                  onChange={(e) => setFormData({ ...formData, profileId: e.target.value })}
                  className="w-full border border-sky-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                >
                  {profiles && profiles.length > 0 ? (
                    profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.category === 'administrative' ? 'Perfil Administrativo' : 'Perfil IT / Técnico'} ({p.headline})
                      </option>
                    ))
                  ) : (
                    <option value={activeProfile?.id || 'profile-david'}>
                      {activeProfile?.name || 'Perfil Activo'}
                    </option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Empresa *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Ej: Quirónsalud, GFT, Abertis, Indra..."
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Puesto / Vacante *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Ej: Administrativo/a de Gestión o Analista Programador Senior"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estado del Proceso</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                  >
                    <option value="enviada">Enviada / En espera</option>
                    <option value="en_revision">En revisión</option>
                    <option value="entrevista_rrhh">Entrevista RRHH</option>
                    <option value="prueba_tecnica">Prueba / Entrevista Técnica</option>
                    <option value="entrevista_final">Entrevista Final</option>
                    <option value="oferta">Oferta Recibida 🎉</option>
                    <option value="descartada">Descartada / Rechazada</option>
                    <option value="en_espera">Pausada / En reserva</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Portal de Origen</label>
                  <select
                    value={formData.portalSource}
                    onChange={(e) => setFormData({ ...formData, portalSource: e.target.value as PortalSource })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                  >
                    <option value="infojobs">InfoJobs</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="barcelona_activa">Treball Barcelona Activa</option>
                    <option value="feina_activa_soc">Feina Activa SOC / Generalitat</option>
                    <option value="tecnoempleo">Tecnoempleo / Ticjob</option>
                    <option value="directo_empresa">Web Directa Empresa</option>
                    <option value="contacto_personal">Contacto Personal / Referido</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modalidad de Trabajo</label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value as Modality })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                  >
                    <option value="hibrido">Híbrido (Barcelona)</option>
                    <option value="remoto">100% Remoto</option>
                    <option value="presencial">Presencial (Les Corts / BCN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ubicación / Zona</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Barcelona (Les Corts / Diagonal), 22@..."
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha de Envío del CV</label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({ ...formData, applicationDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              {/* Contact Person Details */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
                <h3 className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Persona de Contacto / Reclutador(a)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Nombre y Apellidos</label>
                    <input
                      type="text"
                      value={formData.contactPerson.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, name: e.target.value },
                        })
                      }
                      placeholder="Ej: Mireia Puig"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Cargo / Rol</label>
                    <input
                      type="text"
                      value={formData.contactPerson.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, role: e.target.value },
                        })
                      }
                      placeholder="Ej: Talent Acquisition Lead"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Email Directo</label>
                    <input
                      type="email"
                      value={formData.contactPerson.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, email: e.target.value },
                        })
                      }
                      placeholder="contacto@empresa.com"
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">Teléfono</label>
                    <input
                      type="tel"
                      value={formData.contactPerson.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, phone: e.target.value },
                        })
                      }
                      placeholder="+34 93..."
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 block mb-0.5">LinkedIn del Contacto</label>
                    <input
                      type="text"
                      value={formData.contactPerson.linkedin || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactPerson: { ...formData.contactPerson, linkedin: e.target.value },
                        })
                      }
                      placeholder="linkedin.com/in/..."
                      className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-xs">
                    Historial de Fases & Entrevistas ({formData.interviews.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Anota cada ronda técnica, con RRHH o directiva para no olvidar ningún detalle
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddInterview}
                  className="px-2.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Ronda</span>
                </button>
              </div>

              {formData.interviews.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium text-xs text-slate-600">No hay entrevistas agendadas todavía</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pulsa "Añadir Ronda" cuando te contacten para fijar fecha o videoconferencia.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.interviews.map((interview, idx) => (
                    <div
                      key={interview.id}
                      className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-2.5 relative group"
                    >
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={interview.round}
                            onChange={(e) => handleUpdateInterview(idx, 'round', e.target.value)}
                            className="font-bold text-slate-900 text-xs bg-transparent border-b border-dashed border-slate-300 focus:outline-sky-600"
                          />
                          <label className="flex items-center gap-1 cursor-pointer text-[11px] text-slate-600 ml-2">
                            <input
                              type="checkbox"
                              checked={interview.completed}
                              onChange={(e) => handleUpdateInterview(idx, 'completed', e.target.checked)}
                              className="rounded text-sky-600 focus:ring-sky-500"
                            />
                            <span>Realizada</span>
                          </label>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteInterview(idx)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                          title="Eliminar entrevista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10.5px] text-slate-500 block mb-0.5">Fecha</label>
                          <input
                            type="date"
                            value={interview.date}
                            onChange={(e) => handleUpdateInterview(idx, 'date', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] text-slate-500 block mb-0.5">Hora</label>
                          <input
                            type="time"
                            value={interview.time}
                            onChange={(e) => handleUpdateInterview(idx, 'time', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="text-[10.5px] text-slate-500 block mb-0.5">Formato</label>
                          <select
                            value={interview.format}
                            onChange={(e) => handleUpdateInterview(idx, 'format', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          >
                            <option value="videollamada">Videollamada</option>
                            <option value="presencial">Presencial (Oficinas)</option>
                            <option value="telefonica">Llamada Telefónica</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10.5px] text-slate-500 block mb-0.5">Plataforma / Lugar</label>
                          <input
                            type="text"
                            value={interview.platform || ''}
                            onChange={(e) => handleUpdateInterview(idx, 'platform', e.target.value)}
                            placeholder="Teams, Meet, Zoom..."
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10.5px] text-slate-500 block mb-0.5">Interlocutores / Entrevistadores</label>
                        <input
                          type="text"
                          value={interview.interviewers}
                          onChange={(e) => handleUpdateInterview(idx, 'interviewers', e.target.value)}
                          placeholder="Ej: Marc Soler (Tech Lead), Laura Mas (People)"
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] text-slate-500 block mb-0.5">Notas, Preguntas & Conclusiones</label>
                        <textarea
                          rows={2}
                          value={interview.notes}
                          onChange={(e) => handleUpdateInterview(idx, 'notes', e.target.value)}
                          placeholder="Preguntaron por arquitectura Liferay DXP, microservicios en Spring, proyecto piloto..."
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rango Salarial Indicado en Oferta</label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="Ej: 48.000€ - 54.000€ brutos/año o 24.000€ - 28.000€"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Salario Negociado / Comentado</label>
                  <input
                    type="text"
                    value={formData.salaryDiscussed || ''}
                    onChange={(e) => setFormData({ ...formData, salaryDiscussed: e.target.value })}
                    placeholder="Ej: 52.000€ o tarifa 320€/día autónomo"
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Contrato Deseado</label>
                  <select
                    value={formData.contractModality}
                    onChange={(e) => setFormData({ ...formData, contractModality: e.target.value as any })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 bg-white focus:outline-sky-600"
                  >
                    <option value="indiferente">Indiferente (Plantilla o Autónomo)</option>
                    <option value="indefinido">Contrato Indefinido (Plantilla)</option>
                    <option value="autonomo_b2b">Autónomo / B2B Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha de Próximo Seguimiento (Follow-up)</label>
                  <input
                    type="date"
                    value={formData.followUpDate || ''}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Enlace a la Oferta Original</label>
                <input
                  type="url"
                  value={formData.jobUrl || ''}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  placeholder="https://www.infojobs.net/..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Etiquetas (separadas por comas)</label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Gestión, Facturación, Liferay, Java, Barcelona..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas Generales & Estrategia</label>
                <textarea
                  rows={4}
                  value={formData.generalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, generalNotes: e.target.value })}
                  placeholder="Detalles sobre el proceso, interlocutores clave, sensaciones tras la entrevista, puntos fuertes a destacar..."
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Seguro que deseas eliminar esta candidatura?')) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Candidatura
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {isEditing ? 'Guardar Cambios' : 'Crear Candidatura'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
