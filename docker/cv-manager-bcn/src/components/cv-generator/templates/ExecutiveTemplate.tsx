import React from 'react';
import { CVProfile, CVDesignSettings } from '../../../types';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

interface Props {
  profile: CVProfile;
  settings: CVDesignSettings;
  onEditPhoto?: () => void;
}

export const ExecutiveTemplate: React.FC<Props> = ({ profile, settings, onEditPhoto }) => {
  const { personal, summary, qualities, coreCompetencies, experiences, education, technologies, languages, otherInfo } = profile;
  const { visibleSections } = settings;

  return (
    <div className="w-full bg-white text-neutral-800 shadow-sm print:shadow-none min-h-[1050px] p-10 md:p-12 font-serif text-[13.5px] leading-relaxed">
      {/* Header */}
      <header className="text-center border-b border-neutral-300 pb-6 mb-8">
        <div className="flex flex-col items-center justify-center">
          {visibleSections.photo && personal.showPhoto && personal.photoUrl && (
            <div
              className="relative group cursor-pointer mb-3"
              onClick={onEditPhoto}
              title="Haz clic para cambiar la foto de perfil"
            >
              <img
                src={personal.photoUrl}
                alt={personal.fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border border-neutral-300 shadow-xs group-hover:opacity-90 transition-opacity"
              />
              {onEditPhoto && (
                <div className="absolute inset-0 bg-neutral-900/50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity no-print">
                  <span className="text-xs">📷</span>
                  <span className="text-[9px] font-medium mt-0.5">Editar</span>
                </div>
              )}
            </div>
          )}
          <h1 className="text-3xl font-normal tracking-wide text-neutral-900 font-serif uppercase">
            {personal.fullName}
          </h1>
          <p className="text-sm font-sans tracking-widest uppercase text-neutral-600 mt-1 font-medium">
            {personal.headline} · {personal.yearsExperience}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-3 font-sans text-xs text-neutral-600">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-neutral-500" />
              {personal.street}, {personal.postalCode} {personal.city}
            </span>
            <span className="text-neutral-400">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-neutral-500" />
              {personal.phonePrimary} / {personal.phoneSecondary}
            </span>
            <span className="text-neutral-400">|</span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              {personal.email}
            </span>
            {personal.linkedin && (
              <>
                <span className="text-neutral-400">|</span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-neutral-500" />
                  {personal.linkedin}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Summary */}
      {visibleSections.summary && (
        <section className="mb-6 font-sans">
          <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-2">
            Perfil Ejecutivo
          </h2>
          <p className="text-neutral-700 text-justify text-xs leading-relaxed">
            {summary}
          </p>
        </section>
      )}

      {/* Core Competencies */}
      {visibleSections.competencies && coreCompetencies.length > 0 && (
        <section className="mb-6 page-break-avoid font-sans">
          <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-2.5">
            Liderazgo Técnico y Competencias
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coreCompetencies.map((comp, idx) => (
              <div key={idx} className="border-l-2 border-neutral-400 pl-3">
                <h3 className="font-semibold text-neutral-900 text-xs">{comp.title}</h3>
                <p className="text-xs text-neutral-600 mt-0.5">{comp.skills}</p>
                <p className="text-[11.5px] text-neutral-500 mt-1 italic">{comp.achievements}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && (
        <section className="mb-6 font-sans">
          <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-4">
            Experiencia Profesional y Proyectos
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="page-break-avoid">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-neutral-900 text-xs">
                    {exp.title} <span className="font-normal text-neutral-500">| {exp.company}</span>
                  </h3>
                  <span className="font-mono text-[11px] text-neutral-500">{exp.period}</span>
                </div>
                <p className="text-xs text-neutral-700 mt-1">{exp.description}</p>
                {exp.technologies && (
                  <p className="text-[11px] text-neutral-500 font-mono mt-1">
                    <span className="font-medium text-neutral-700 font-sans">Tecnologías: </span>
                    {exp.technologies.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Tech Stack in 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
        {visibleSections.education && (
          <section className="page-break-avoid">
            <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-3">
              Formación Académica
            </h2>
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <span className="font-mono text-[11px] text-neutral-500 block">{edu.year}</span>
                  <span className="font-medium text-neutral-800">{edu.title}</span>
                  {edu.institution && (
                    <span className="text-neutral-500 text-[11px] block">{edu.institution}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-4 page-break-avoid">
          {visibleSections.technologies && (
            <section>
              <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-3">
                Ecosistema Tecnológico
              </h2>
              <div className="text-xs space-y-1.5 text-neutral-700">
                <p><strong>Open Source: </strong>{technologies.openSource.slice(0, 8).join(', ')}</p>
                <p><strong>Comercial: </strong>{technologies.commercialSoftware.join(', ')}</p>
                <p><strong>Metodologías: </strong>{technologies.methodologies.join(', ')}</p>
              </div>
            </section>
          )}

          {visibleSections.languages && (
            <section>
              <h2 className="text-xs uppercase tracking-widest font-bold text-neutral-900 border-b border-neutral-200 pb-1 mb-2">
                Idiomas y Datos
              </h2>
              <div className="text-xs space-y-1 text-neutral-700">
                {languages.map((l, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{l.language}</span>
                    <span className="text-neutral-500">{l.level}</span>
                  </div>
                ))}
                <p className="pt-1 text-neutral-500 text-[11px] italic">
                  {personal.availability} · {personal.billingPreference}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
