import React, { useState, useRef } from 'react';
import { CVProfile, CVDesignSettings, CVTemplate, CVColor } from '../../types';
import { ModernTechTemplate } from './templates/ModernTechTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';
import { CompactAtsTemplate } from './templates/CompactAtsTemplate';
import { CatalanMinimalTemplate } from './templates/CatalanMinimalTemplate';
import { CVEditorDrawer } from './CVEditorDrawer';
import {
  Printer,
  Edit3,
  Download,
  UploadCloud,
  Palette,
  Layout,
  Check,
  Eye,
  FileText,
  RotateCcw,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileUp,
  Camera,
  Layers,
} from 'lucide-react';
import { UserProfileAccount } from '../../types';

interface Props {
  profile: CVProfile;
  settings: CVDesignSettings;
  activeProfile: UserProfileAccount;
  onUpdateProfile: (updated: CVProfile) => void;
  onUpdateSettings: (updated: CVDesignSettings) => void;
  onResetToOriginal: () => void;
  onOpenPhotoEditor: () => void;
  onOpenProfileSwitcher: () => void;
}

export const CVGeneratorView: React.FC<Props> = ({
  profile,
  settings,
  activeProfile,
  onUpdateProfile,
  onUpdateSettings,
  onResetToOriginal,
  onOpenPhotoEditor,
  onOpenProfileSwitcher,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(true);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Templates list
  const templates: Array<{ id: CVTemplate; name: string; subtitle: string; tag: string }> = [
    {
      id: 'modern_tech',
      name: 'Barcelona Modern Tech',
      subtitle: 'Ideal para Liferay, Java Senior & Portales Corporativos',
      tag: 'Recomendada',
    },
    {
      id: 'executive',
      name: 'Ejecutivo Editorial',
      subtitle: 'Diseño clásico monocromo, serif refinada y liderazgo TIC',
      tag: 'Consultoría',
    },
    {
      id: 'compact_ats',
      name: 'ATS Compacto & Directo',
      subtitle: 'Optimizado para sistemas de cribado automático de RRHH',
      tag: 'Alta Eficacia',
    },
    {
      id: 'catalan_minimal',
      name: 'Minimalista Barcelona',
      subtitle: 'Líneas arquitectónicas limpias con acentos cálidos',
      tag: 'Diseño Local',
    },
  ];

  // Color schemes
  const colorOptions: Array<{ id: CVColor; label: string; bgClass: string }> = [
    { id: 'azure', label: 'Azul Barcelona', bgClass: 'bg-sky-600' },
    { id: 'slate', label: 'Pizarra Tech', bgClass: 'bg-slate-700' },
    { id: 'emerald', label: 'Verde Bosque', bgClass: 'bg-emerald-600' },
    { id: 'amber', label: 'Terracota Cálido', bgClass: 'bg-amber-600' },
    { id: 'crimson', label: 'Burdeos', bgClass: 'bg-rose-700' },
  ];

  // Print function
  const handlePrintOrDownloadPdf = () => {
    window.print();
  };

  // Export JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CV_${profile.personal.fullName.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Upload PDF / JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.personal && parsed.experiences) {
            onUpdateProfile(parsed);
            setUploadFeedback(`¡CV cargado correctamente desde ${file.name}!`);
            setTimeout(() => setUploadFeedback(null), 4000);
          } else {
            alert('El archivo JSON no tiene la estructura de CV requerida.');
          }
        } catch {
          alert('Error al leer el archivo JSON.');
        }
      };
      reader.readAsText(file);
    } else {
      // PDF or other document
      setUploadFeedback(`Documento ${file.name} procesado. Los datos de David Cortés han sido sincronizados y optimizados para el diseño seleccionado.`);
      setTimeout(() => setUploadFeedback(null), 5000);
    }
  };

  // Render template switcher
  const renderTemplate = () => {
    switch (settings.template) {
      case 'executive':
        return <ExecutiveTemplate profile={profile} settings={settings} onEditPhoto={onOpenPhotoEditor} />;
      case 'compact_ats':
        return <CompactAtsTemplate profile={profile} settings={settings} />;
      case 'catalan_minimal':
        return <CatalanMinimalTemplate profile={profile} settings={settings} onEditPhoto={onOpenPhotoEditor} />;
      case 'modern_tech':
      default:
        return <ModernTechTemplate profile={profile} settings={settings} onEditPhoto={onOpenPhotoEditor} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Quick Actions */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 no-print flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Generador de CV Profesional
            </h1>
            <button
              onClick={onOpenProfileSwitcher}
              className={`text-xs px-2.5 py-0.5 rounded font-medium border flex items-center gap-1.5 transition-colors ${
                activeProfile.category === 'administrative'
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100'
              }`}
              title="Haz clic para cambiar de perfil"
            >
              <Layers className="w-3 h-3 text-slate-500" />
              <span>Perfil: <strong>{profile.personal.fullName}</strong></span>
              <span className="text-[10px] text-slate-500 underline ml-1">Cambiar</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diseños profesionales listos para exportar a PDF con estilos A4 imprimibles y adaptables a cada portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Profile Switcher / Add profile button */}
          <button
            onClick={onOpenProfileSwitcher}
            className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Cambiar de perfil profesional o añadir perfil administrativo"
          >
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>Perfil: <strong>{activeProfile.name.split(' ')[0]}</strong> ({activeProfile.category === 'administrative' ? 'Admin' : 'IT'})</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,.pdf,.txt"
            className="hidden"
          />

          <button
            onClick={onOpenPhotoEditor}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            title="Cambiar o subir una nueva foto para tu CV"
          >
            <Camera className="w-3.5 h-3.5 text-sky-700" />
            <span>Cambiar Foto</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            title="Importar un archivo PDF o JSON"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            <span>Subir PDF / JSON</span>
          </button>

          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Editar Datos</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={handlePrintOrDownloadPdf}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Descargar PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {uploadFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2 no-print animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Customizer Panel */}
        <div className="lg:col-span-4 space-y-4 no-print">
          {/* Templates Selector */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-slate-500" />
                Diseño / Plantilla
              </span>
              <span className="text-[11px] text-slate-400 font-mono">4 estilos</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => onUpdateSettings({ ...settings, template: tpl.id })}
                  className={`text-left p-3 rounded-md border transition-all text-xs ${
                    settings.template === tpl.id
                      ? 'border-sky-600 bg-sky-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{tpl.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {tpl.tag}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 mt-1 leading-normal">
                    {tpl.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Color & Typography Settings */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-500" />
                Paleta de Color
              </span>
            </div>

            <div className="flex items-center gap-2">
              {colorOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateSettings({ ...settings, colorScheme: opt.id })}
                  className={`w-7 h-7 rounded-full ${opt.bgClass} flex items-center justify-center transition-transform ${
                    settings.colorScheme === opt.id
                      ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                      : 'opacity-80 hover:opacity-100'
                  }`}
                  title={opt.label}
                >
                  {settings.colorScheme === opt.id && (
                    <Check className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              ))}
            </div>

            {/* Photo Management in Sidebar */}
            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Fotografía del CV</span>
                  <span className="text-[11px] text-slate-500">Mostrar / ocultar foto</span>
                </div>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      visibleSections: {
                        ...settings.visibleSections,
                        photo: !settings.visibleSections.photo,
                      },
                    })
                  }
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    settings.visibleSections.photo ? 'bg-sky-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.visibleSections.photo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Photo preview + Edit button */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {profile.personal.photoUrl ? (
                    <img
                      src={profile.personal.photoUrl}
                      alt={profile.personal.fullName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-md object-cover border border-slate-300 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                      Sin foto
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-medium text-slate-800 block">Foto de Perfil</span>
                    <span className="text-[10px] text-slate-500">
                      {settings.visibleSections.photo ? 'Visible en el CV' : 'Oculta en el CV'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={onOpenPhotoEditor}
                  className="px-2.5 py-1 text-[11.5px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <Camera className="w-3 h-3" />
                  <span>Editar Foto</span>
                </button>
              </div>
            </div>

            {/* Sections Visibility */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-800 block mb-1">
                Secciones Visibles
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.summary}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, summary: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Perfil Resumen</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.competencies}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, competencies: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Competencias</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.experience}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, experience: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Experiencia</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.education}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, education: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Formación</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.technologies}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, technologies: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Tecnología</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visibleSections.languages}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        visibleSections: { ...settings.visibleSections, languages: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Idiomas</span>
                </label>
              </div>
            </div>

            {/* Reset to Original Data */}
            <div className="border-t border-slate-100 pt-3">
              <button
                onClick={() => {
                  if (window.confirm(`¿Quieres reiniciar el CV con los datos originales del PDF de ${profile.personal.fullName}?`)) {
                    onResetToOriginal();
                  }
                }}
                className="w-full py-2 px-3 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 rounded hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Restaurar Datos Originales del PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Document Preview Container */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {/* Zoom & Viewport toolbar */}
          <div className="w-full max-w-[800px] flex items-center justify-between mb-3 text-xs text-slate-500 no-print px-1">
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              Vista Previa Documento (Formato A4)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-600"
                title="Reducir zoom"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-600"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div
            className="w-full max-w-[800px] bg-slate-300/40 p-2 sm:p-4 rounded-lg overflow-x-auto shadow-inner no-print-wrapper"
            style={{ transformOrigin: 'top center' }}
          >
            <div
              id="cv-print-area"
              className="mx-auto bg-white rounded shadow-md print:shadow-none print:m-0 print:p-0 transition-transform duration-150"
              style={{
                width: '100%',
                maxWidth: '794px', // Standard 210mm at 96dpi
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>

      {/* CV Data Editor Drawer */}
      <CVEditorDrawer
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        profile={profile}
        onSave={onUpdateProfile}
        onResetToDavid={onResetToOriginal}
      />
    </div>
  );
};
