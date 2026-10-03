import React from 'react';
import { CVProfile, CVDesignSettings } from '../../../types';
import { MapPin, Phone, Mail, Globe, Layers } from 'lucide-react';

interface Props {
  profile: CVProfile;
  settings: CVDesignSettings;
  onEditPhoto?: () => void;
}

export const CatalanMinimalTemplate: React.FC<Props> = ({ profile, settings, onEditPhoto }) => {
  const { personal, summary, coreCompetencies, experiences, education, technologies, languages, otherInfo } = profile;
  const { visibleSections } = settings;

  return (
    <div className="w-full bg-[#fdfdfb] text-neutral-800 shadow-sm print:shadow-none min-h-[1050px] p-8 md:p-12 font-sans text-[12.5px] leading-relaxed">
      {/* Header with Warm Architectural Accent Bar */}
      <div className="border-l-4 border-amber-700 pl-6 pb-2 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {personal.fullName}
            </h1>
            <p className="text-amber-800 font-semibold text-sm tracking-wide mt-0.5">
              {personal.headline} · <span className="text-neutral-600 font-normal">{personal.yearsExperience}</span>
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {personal.street}, {personal.postalCode} {personal.city} ({personal.district})
            </p>
          </div>

          {visibleSections.photo && personal.showPhoto && personal.photoUrl && (
            <div
              className="relative group cursor-pointer"
              onClick={onEditPhoto}
              title="Haz clic para cambiar la foto de perfil"
            >
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-md object-cover border border-amber-200/80 shadow-xs group-hover:opacity-90 transition-opacity"
              />
              {onEditPhoto && (
                <div className="absolute inset-0 bg-neutral-900/50 rounded-md flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity no-print">
                  <span className="text-xs">📷</span>
                  <span className="text-[9px] font-medium mt-0.5">Cambiar</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-neutral-600 pt-2 border-t border-neutral-200/60">
          <span className="flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-amber-700" />
            {personal.phonePrimary} / {personal.phoneSecondary}
          </span>
          <span className="text-neutral-300">·</span>
          <span className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-amber-700" />
            {personal.email}
          </span>
          {personal.linkedin && (
            <>
              <span className="text-neutral-300">·</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-amber-700" />
                {personal.linkedin}
              </span>
            </>
          )}
          <span className="text-neutral-300">·</span>
          <span className="text-neutral-500 font-medium">{personal.billingPreference}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          {/* Summary */}
          {visibleSections.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
                Extracto Profesional
              </h2>
              <p className="text-neutral-700 text-justify text-xs leading-relaxed">
                {summary}
              </p>
            </section>
          )}

          {/* Competencies */}
          {visibleSections.competencies && coreCompetencies.length > 0 && (
            <section className="page-break-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2.5">
                Capacidades de Liderazgo y Calidad
              </h2>
              <div className="space-y-2.5">
                {coreCompetencies.map((comp, idx) => (
                  <div key={idx} className="bg-amber-50/40 p-2.5 rounded border border-amber-200/50">
                    <h3 className="font-bold text-xs text-amber-900">{comp.title}</h3>
                    <p className="text-xs text-neutral-700 mt-0.5">{comp.skills}</p>
                    <p className="text-[11.5px] text-neutral-600 italic mt-0.5">{comp.achievements}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Experiences */}
          {visibleSections.experience && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                Trayectoria de Proyectos y Experiencia
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="page-break-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-neutral-900 text-xs">{exp.title}</h3>
                      <span className="font-mono text-[11px] text-amber-800 font-medium">{exp.period}</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-medium">{exp.company}</p>
                    <p className="text-xs text-neutral-700 mt-1">{exp.description}</p>
                    {exp.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {exp.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10.5px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-4 space-y-6">
          {visibleSections.technologies && (
            <section className="page-break-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                Stack Tecnológico
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-amber-900 text-[11.5px] mb-1">Portales & Java</h4>
                  <p className="text-neutral-700 leading-snug">{technologies.openSource.join(', ')}</p>
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-[11.5px] mb-1">Comercial & Metodologías</h4>
                  <p className="text-neutral-700 leading-snug">
                    {technologies.commercialSoftware.join(', ')} · {technologies.methodologies.join(', ')}
                  </p>
                </div>
              </div>
            </section>
          )}

          {visibleSections.education && (
            <section className="page-break-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
                Educación y Títulos
              </h2>
              <div className="space-y-2 text-xs">
                {education.map((e) => (
                  <div key={e.id}>
                    <span className="font-mono text-[11px] text-amber-800 font-bold block">{e.year}</span>
                    <span className="font-semibold text-neutral-800">{e.title}</span>
                    {e.institution && <p className="text-[11px] text-neutral-500">{e.institution}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.languages && (
            <section className="page-break-avoid">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
                Idiomas
              </h2>
              <div className="space-y-1 text-xs">
                {languages.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-medium text-neutral-800">{l.language}</span>
                    <span className="text-neutral-600">{l.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.otherInfo && otherInfo.length > 0 && (
            <section className="page-break-avoid text-xs text-neutral-600 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-300 pb-1 mb-2">
                Disponibilidad
              </h2>
              {otherInfo.map((info, idx) => (
                <p key={idx}>· {info}</p>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
