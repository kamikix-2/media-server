import React from 'react';
import { CVProfile, CVDesignSettings } from '../../../types';

interface Props {
  profile: CVProfile;
  settings: CVDesignSettings;
}

export const CompactAtsTemplate: React.FC<Props> = ({ profile, settings }) => {
  const { personal, summary, coreCompetencies, experiences, education, technologies, languages, qualities } = profile;
  const { visibleSections } = settings;

  return (
    <div className="w-full bg-white text-slate-900 shadow-sm print:shadow-none min-h-[1050px] p-8 font-sans text-[12px] leading-snug">
      {/* ATS Header */}
      <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
          {personal.fullName}
        </h1>
        <p className="text-xs font-semibold text-slate-800 mt-0.5">
          {personal.headline} | {personal.yearsExperience} | {personal.district}, {personal.city}
        </p>
        <p className="text-[11px] text-slate-700 mt-1">
          Tel: {personal.phonePrimary} / {personal.phoneSecondary} | Email: {personal.email} | {personal.linkedin} | DNI: {personal.dni}
        </p>
        <p className="text-[10.5px] text-slate-600 italic mt-0.5">
          {personal.availability} | Modalidad: {personal.billingPreference}
        </p>
      </div>

      {/* Summary */}
      {visibleSections.summary && (
        <section className="mb-3.5">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Resumen Profesional
          </h2>
          <p className="text-[11.5px] text-slate-800 text-justify">
            {summary}
          </p>
        </section>
      )}

      {/* Technical Skills Table */}
      {visibleSections.technologies && (
        <section className="mb-3.5 page-break-avoid">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1.5">
            Competencias Técnicas & Herramientas
          </h2>
          <div className="grid grid-cols-1 gap-1 text-[11px]">
            <div>
              <strong className="text-slate-900">Ecosistema Java & Portales: </strong>
              <span className="text-slate-700">{technologies.openSource.join(', ')}</span>
            </div>
            <div>
              <strong className="text-slate-900">Software Comercial & ERP: </strong>
              <span className="text-slate-700">{technologies.commercialSoftware.join(', ')}</span>
            </div>
            <div>
              <strong className="text-slate-900">Metodologías & DevOps: </strong>
              <span className="text-slate-700">{technologies.methodologies.join(', ')} | {technologies.collaborativeTools.join(', ')}</span>
            </div>
          </div>
        </section>
      )}

      {/* Core Competencies */}
      {visibleSections.competencies && coreCompetencies.length > 0 && (
        <section className="mb-3.5 page-break-avoid">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-1">
            Capacidades de Gestión y Optimización
          </h2>
          <div className="space-y-1 text-[11px]">
            {coreCompetencies.map((c, i) => (
              <div key={i}>
                <span className="font-bold text-slate-900">{c.title}: </span>
                <span className="text-slate-700">{c.skills} </span>
                <span className="text-slate-600 italic">[{c.achievements}]</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && (
        <section className="mb-3.5">
          <h2 className="text-[11.5px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5 mb-2">
            Historial de Proyectos y Experiencia Laboral
          </h2>
          <div className="space-y-2.5">
            {experiences.map((exp) => (
              <div key={exp.id} className="page-break-avoid">
                <div className="flex justify-between items-baseline font-bold text-[11.5px] text-slate-900">
                  <span>{exp.title} — {exp.company}</span>
                  <span className="font-mono text-[10.5px] font-normal text-slate-600">{exp.period}</span>
                </div>
                <p className="text-[11px] text-slate-700 mt-0.5">{exp.description}</p>
                {exp.technologies && (
                  <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                    <strong>Tecnologías:</strong> {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Languages */}
      <div className="grid grid-cols-2 gap-4 page-break-avoid border-t border-slate-300 pt-2 text-[11px]">
        {visibleSections.education && (
          <div>
            <h3 className="font-bold uppercase text-[11px] text-slate-900 mb-1">Formación y Certificaciones</h3>
            <ul className="space-y-1">
              {education.map((e) => (
                <li key={e.id}>
                  <strong className="font-mono text-[10px]">{e.year}:</strong> {e.title} {e.institution ? `(${e.institution})` : ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          {visibleSections.languages && (
            <div className="mb-2">
              <h3 className="font-bold uppercase text-[11px] text-slate-900 mb-1">Idiomas</h3>
              <p className="text-slate-700">
                {languages.map((l) => `${l.language} (${l.level})`).join(' | ')}
              </p>
            </div>
          )}

          {visibleSections.qualities && qualities.length > 0 && (
            <div>
              <h3 className="font-bold uppercase text-[11px] text-slate-900 mb-1">Cualidades</h3>
              <p className="text-slate-700 text-[10.5px]">
                {qualities.join(' · ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
