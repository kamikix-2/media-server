import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Image, RotateCcw, Check, Sparkles, Trash2, Eye, ShieldCheck, Loader2 } from 'lucide-react';
import { optimizeImage } from '../../utils/imageOptimizer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoUrl: string;
  showPhoto: boolean;
  onSavePhoto: (photoUrl: string, showPhoto: boolean) => void;
  onResetToOriginal: () => void;
}

export const PhotoEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentPhotoUrl,
  showPhoto,
  onSavePhoto,
  onResetToOriginal,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string>(currentPhotoUrl);
  const [visible, setVisible] = useState<boolean>(showPhoto);
  const [inputUrl, setInputUrl] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [optimizationNote, setOptimizationNote] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process file with automatic compression to ~35KB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsProcessing(true);
      setOptimizationNote('Optimizando y comprimiendo foto para el CV...');
      const optimizedDataUrl = await optimizeImage(file, 400, 400, 0.82);
      setPhotoUrl(optimizedDataUrl);
      setVisible(true);
      setOptimizationNote('✓ Foto optimizada para CV (~35 KB, nitidez perfecta sin coste ni cuotas)');
      setTimeout(() => setOptimizationNote(null), 5000);
    } catch (err) {
      console.error('Error optimizing photo:', err);
      // Fallback to regular FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPhotoUrl(event.target.result);
          setVisible(true);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = async () => {
    if (inputUrl.trim()) {
      setIsProcessing(true);
      try {
        const optimized = await optimizeImage(inputUrl.trim(), 400, 400, 0.82);
        setPhotoUrl(optimized);
      } catch {
        setPhotoUrl(inputUrl.trim());
      } finally {
        setIsProcessing(false);
      }
      setVisible(true);
      setInputUrl('');
    }
  };

  const handleSave = () => {
    onSavePhoto(photoUrl, visible);
    onClose();
  };

  // Preset sample avatar options
  const defaultDavidAvatar = '/src/assets/images/david_avatar_1790503946966.jpg';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Editar Foto del Perfil & CV</h2>
              <p className="text-[11px] text-slate-500">
                Sube tu imagen o actualiza la foto de tu currículum
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

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Live Preview row */}
          <div className="flex items-center justify-center gap-6 p-4 bg-slate-50 border border-slate-200/80 rounded-lg">
            {/* Square version preview (as appears in Modern Tech template) */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden border-2 border-slate-300 shadow-xs relative group bg-slate-200">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Vista previa"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Image className="w-8 h-8" />
                  </div>
                )}
                {!visible && (
                  <div className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center text-[10px] font-bold">
                    Oculta
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                Formato CV
              </span>
            </div>

            {/* Circular version preview (as appears in Executive / Navbar) */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-slate-300 shadow-xs relative group bg-slate-200">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Vista previa circular"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Image className="w-8 h-8" />
                  </div>
                )}
                {!visible && (
                  <div className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center text-[10px] font-bold">
                    Oculta
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-1.5">
                Avatar Circular
              </span>
            </div>

            {/* Visibility Toggle */}
            <div className="pl-4 border-l border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-800 block text-xs">Visibilidad en el CV</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700">Mostrar foto en CV</span>
              </label>
              <p className="text-[10.5px] text-slate-400 max-w-[150px] leading-tight">
                Puedes ocultarla si postulas a ofertas con formato ciego o sin foto.
              </p>
            </div>
          </div>

          {/* Optimization Feedback banner */}
          {optimizationNote && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{optimizationNote}</span>
            </div>
          )}

          {isProcessing && (
            <div className="bg-sky-50 border border-sky-200 text-sky-800 px-3 py-2 rounded-lg text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
              <span>Comprimiendo y optimizando imagen sin perder calidad...</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1.5 flex items-center justify-between">
              <span>1. Subir archivo desde tu ordenador / móvil</span>
              <span className="text-[10.5px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Compresión inteligente activa
              </span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                dragOver
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 text-sky-700 mx-auto mb-1.5 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-sky-700 mx-auto mb-1.5" />
              )}
              <p className="font-semibold text-slate-800 text-xs">
                {isProcessing ? 'Procesando y reduciendo tamaño...' : 'Haz clic para elegir una imagen o arrástrala aquí'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cualquier foto de alta resolución se optimiza automáticamente a ~35 KB
              </p>
            </div>
          </div>

          {/* Image URL Alternative */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              2. O pegar enlace directo de imagen (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://ejemplo.com/mi-foto-profesional.jpg"
                className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-sky-600"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!inputUrl.trim()}
                className="px-3 py-1.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                Aplicar URL
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div>
            <span className="font-semibold text-slate-800 block mb-2">
              3. Opciones rápidas de restauración
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPhotoUrl(defaultDavidAvatar);
                  setVisible(true);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1.5 text-slate-700 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Foto de David Cortés (Original)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoUrl('');
                  setVisible(false);
                }}
                className="px-3 py-1.5 border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1.5 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar Foto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onResetToOriginal();
              setPhotoUrl(defaultDavidAvatar);
              setVisible(true);
            }}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            Restaurar predeterminada
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded bg-white hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar Foto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
