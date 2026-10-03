import React, { useState } from 'react';
import { CVProfile, ProjectExperience, EducationItem } from '../../types';
import { X, Plus, Trash2, Save, Undo2, Sparkles, Upload } from 'lucide-react';
import { optimizeImage } from '../../utils/imageOptimizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: CVProfile;
  onSave: (updated: CVProfile) => void;
  onResetToDavid: () => void;
}

export const CVEditorDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  onResetToDavid,
}) => {
  const [formData, setFormData] = useState<CVProfile>(JSON.parse(JSON.stringify(profile)));
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'tech' | 'raw_import'>('personal');
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePersonalChange = (field: keyof typeof formData.personal, value: any) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const handleAddExperience = () => {
    const newExp: ProjectExperience = {
      id: `exp-${Date.now()}`,
      title: 'Nuevo Proyecto / Cargo',
      company: 'Empresa o Cliente',
      period: '2025 - Presente',
      description: 'Descripción de las responsabilidades principales...',
      technologies: ['Java', 'Liferay DXP'],
      highlights: [],
    };
    setFormData((prev) => ({
      ...prev,
      experiences: [newExp, ...prev.experiences],
    }));
  };

  const handleUpdateExperience = (index: number, field: keyof ProjectExperience, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.experiences];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  const handleDeleteExperience = (index: number) => {
    setFormData((prev) => {
      const updated = prev.experiences.filter((_, i) => i !== index);
      return { ...prev, experiences: updated };
    });
  };

  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: 'Nueva Titulación / Certificación',
      institution: 'Institución o Universidad',
    };
    setFormData((prev) => ({
      ...prev,
      education: [newEdu, ...prev.education],
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const handleDeleteEducation = (index: number) => {
    setFormData((prev) => {
      const updated = prev.education.filter((_, i) => i !== index);
      return { ...prev, education: updated };
    });
  };

  const handleSaveAndApply = () => {
    onSave(formData);
    onClose();
  };

  const handleApplyJsonImport = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(rawJsonText);
      if (!parsed.personal || !parsed.experiences) {
        throw new Error('El JSON no contiene los campos obligatorios "personal" y "experiences".');
      }
      setFormData(parsed);
      onSave(parsed);
      onClose();
    } catch (err: any) {
      setJsonError(err.message || 'Error al procesar el formato JSON.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Editar Datos del Curriculum Vitae</h2>
            <p className="text-xs text-slate-500">
              Modifica tus datos o importa información de un nuevo PDF/documento
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 px-4 bg-white overflow-x-auto text-xs font-medium text-slate-600 gap-2">
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'personal'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Datos Personales
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'experience'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Experiencia ({formData.experiences.length})
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'education'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Formación ({formData.education.length})
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'tech'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Stack & Idiomas
          </button>
          <button
            onClick={() => {
              setActiveTab('raw_import');
              setRawJsonText(JSON.stringify(formData, null, 2));
            }}
            className={`py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'raw_import'
                ? 'border-sky-600 text-sky-700 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Importar / JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'personal' && (
            <div className="space-y-4 text-xs">
              {/* Photo Management Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {formData.personal.photoUrl ? (
                      <img
                        src={formData.personal.photoUrl}
                        alt={formData.personal.fullName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-300"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-base">
                        {formData.personal.fullName?.charAt(0) || 'D'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs">Fotografía del Perfil</h3>
                    <p className="text-[11px] text-slate-500">
                      Sube una imagen o pega un enlace para tu currículum
                    </p>
                    <label className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.personal.showPhoto}
                        onChange={(e) => handlePersonalChange('showPhoto', e.target.checked)}
                        className="rounded text-sky-600"
                      />
                      <span>Mostrar foto en las plantillas del CV</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <label className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium hover:bg-slate-800 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors">
                    <span>Subir Nueva Foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const optimized = await optimizeImage(file, 400, 400, 0.82);
                            handlePersonalChange('photoUrl', optimized);
                            handlePersonalChange('showPhoto', true);
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                handlePersonalChange('photoUrl', ev.target.result);
                                handlePersonalChange('showPhoto', true);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }}
                    />
                  </label>
                  {formData.personal.photoUrl && (
                    <button
                      type="button"
                      onClick={() => handlePersonalChange('photoUrl', '')}
                      className="text-[11px] text-red-600 hover:underline text-center"
                    >
                      Quitar foto
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.personal.fullName}
                    onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Titular Profesional</label>
                  <input
                    type="text"
                    value={formData.personal.headline}
                    onChange={(e) => handlePersonalChange('headline', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Años de Experiencia</label>
                  <input
                    type="text"
                    value={formData.personal.yearsExperience}
                    onChange={(e) => handlePersonalChange('yearsExperience', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DNI / NIE</label>
                  <input
                    type="text"
                    value={formData.personal.dni}
                    onChange={(e) => handlePersonalChange('dni', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Distrito / Zona</label>
                  <input
                    type="text"
                    value={formData.personal.district}
                    onChange={(e) => handlePersonalChange('district', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dirección / Calle</label>
                  <input
                    type="text"
                    value={formData.personal.street}
                    onChange={(e) => handlePersonalChange('street', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Código Postal y Ciudad</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.personal.postalCode}
                      onChange={(e) => handlePersonalChange('postalCode', e.target.value)}
                      placeholder="08029"
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                    />
                    <input
                      type="text"
                      value={formData.personal.city}
                      onChange={(e) => handlePersonalChange('city', e.target.value)}
                      placeholder="Barcelona"
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    value={formData.personal.phonePrimary}
                    onChange={(e) => handlePersonalChange('phonePrimary', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    value={formData.personal.phoneSecondary}
                    onChange={(e) => handlePersonalChange('phoneSecondary', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.personal.email}
                    onChange={(e) => handlePersonalChange('email', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">LinkedIn</label>
                  <input
                    type="text"
                    value={formData.personal.linkedin}
                    onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Disponibilidad</label>
                  <input
                    type="text"
                    value={formData.personal.availability}
                    onChange={(e) => handlePersonalChange('availability', e.target.value)}
                    className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Modalidad de Contratación Preferida</label>
                <input
                  type="text"
                  value={formData.personal.billingPreference}
                  onChange={(e) => handlePersonalChange('billingPreference', e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Extracto / Perfil Profesional</label>
                <textarea
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
                />
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">
                  Total de proyectos y experiencias: {formData.experiences.length}
                </span>
                <button
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-sky-700 text-white rounded text-xs font-medium hover:bg-sky-800 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Proyecto
                </button>
              </div>

              <div className="space-y-3">
                {formData.experiences.map((exp, idx) => (
                  <div key={exp.id || idx} className="border border-slate-200 rounded-md p-3.5 bg-slate-50 space-y-2.5 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Título del Proyecto / Cargo</label>
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Empresa / Cliente</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteExperience(idx)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Eliminar este proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Período (ej: 2019 - 2020)</label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Tecnologías (separadas por comas)</label>
                        <input
                          type="text"
                          value={exp.technologies ? exp.technologies.join(', ') : ''}
                          onChange={(e) =>
                            handleUpdateExperience(
                              idx,
                              'technologies',
                              e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-0.5 text-[11px]">Descripción</label>
                      <textarea
                        rows={2}
                        value={exp.description}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-700">
                  Formación y Títulos: {formData.education.length}
                </span>
                <button
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 bg-sky-700 text-white rounded text-xs font-medium hover:bg-sky-800 flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Añadir Formación
                </button>
              </div>

              <div className="space-y-2.5">
                {formData.education.map((edu, idx) => (
                  <div key={edu.id || idx} className="border border-slate-200 rounded-md p-3 bg-slate-50 flex items-center gap-3 text-xs">
                    <div className="w-24">
                      <label className="font-semibold text-slate-700 block mb-0.5 text-[10.5px]">Año</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-semibold text-slate-700 block mb-0.5 text-[10.5px]">Título / Certificación</label>
                      <input
                        type="text"
                        value={edu.title}
                        onChange={(e) => handleUpdateEducation(idx, 'title', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="font-semibold text-slate-700 block mb-0.5 text-[10.5px]">Institución</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                        className="w-full border border-slate-300 rounded px-2 py-1 text-xs bg-white"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteEducation(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors mt-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Software Open Source & Java (separados por comas)
                </label>
                <textarea
                  rows={3}
                  value={formData.technologies.openSource.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technologies: {
                        ...prev.technologies,
                        openSource: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Software Comercial & ERP (separados por comas)
                </label>
                <input
                  type="text"
                  value={formData.technologies.commercialSoftware.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technologies: {
                        ...prev.technologies,
                        commercialSoftware: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Metodologías (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.technologies.methodologies.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technologies: {
                        ...prev.technologies,
                        methodologies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Herramientas Colaborativas & CI/CD (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.technologies.collaborativeTools.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      technologies: {
                        ...prev.technologies,
                        collaborativeTools: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    }))
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="border-t border-slate-200 pt-3">
                <label className="font-semibold text-slate-700 block mb-1">
                  Cualidades Personales (separadas por comas)
                </label>
                <input
                  type="text"
                  value={formData.qualities.join(', ')}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      qualities: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    }))
                  }
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          {activeTab === 'raw_import' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                Puedes exportar el esquema completo de tu CV o pegar un nuevo JSON para reemplazar o actualizar todos los datos de golpe:
              </p>
              {jsonError && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
                  {jsonError}
                </div>
              )}
              <textarea
                rows={14}
                value={rawJsonText}
                onChange={(e) => setRawJsonText(e.target.value)}
                className="w-full font-mono text-[11px] p-2.5 border border-slate-300 rounded bg-slate-900 text-slate-100"
              />
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleApplyJsonImport}
                  className="px-3.5 py-1.5 bg-sky-700 text-white rounded text-xs font-medium hover:bg-sky-800 transition-colors"
                >
                  Cargar y Aplicar este JSON
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm(`¿Deseas restaurar los datos originales del CV de ${formData.personal.fullName || 'este perfil'}?`)) {
                onResetToDavid();
                onClose();
              }
            }}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-slate-200/60 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5 text-slate-500" />
            Restaurar Datos Originales
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
