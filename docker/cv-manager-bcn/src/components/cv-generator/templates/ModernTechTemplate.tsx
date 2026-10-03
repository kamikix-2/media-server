import React from 'react';
import { CVProfile, CVDesignSettings } from '../../../types';
import { Mail, Phone, MapPin, Globe, Award, CheckCircle2, Briefcase, GraduationCap, Code2, Sparkles, Building2 } from 'lucide-react';

interface Props {
  profile: CVProfile;
  settings: CVDesignSettings;
  onEditPhoto?: () => void;
}

export const ModernTechTemplate: React.FC<Props> = ({ profile, settings, onEditPhoto }) => {
  const { personal, summary, qualities, coreCompetencies, experiences, education, technologies, languages, otherInfo } = profile;
  const { visibleSections, colorScheme } = settings;

  // Accent color mapping
  const colorMap = {
    azure: {
      primary: 'text-sky-700',
      bgPrimary: 'bg-sky-700',
      bgLight: 'bg-sky-50',
      borderPrimary: 'border-sky-700',
      borderLight: 'border-sky-200',
      accentDot: 'bg-sky-600',
    },
    slate: {
      primary: 'text-slate-800',
      bgPrimary: 'bg-slate-800',
      bgLight: 'bg-slate-100',
      borderPrimary: 'border-slate-800',
      borderLight: 'border-slate-200',
      accentDot: 'bg-slate-700',
    },
    emerald: {
      primary: 'text-emerald-700',
      bgPrimary: 'bg-emerald-700',
      bgLight: 'bg-emerald-50',
      borderPrimary: 'border-emerald-700',
      borderLight: 'border-emerald-200',
      accentDot: 'bg-emerald-600',
    },
    amber: {
      primary: 'text-amber-800',
      bgPrimary: 'bg-amber-800',
      bgLight: 'bg-amber-50',
      borderPrimary: 'border-amber-800',
      borderLight: 'border-amber-200',
      accentDot: 'bg-amber-700',
    },
    crimson: {
      primary: 'text-rose-800',
      bgPrimary: 'bg-rose-800',
      bgLight: 'bg-rose-50',
      borderPrimary: 'border-rose-800',
      borderLight: 'border-rose-200',
      accentDot: 'bg-rose-700',
    },
  }[colorScheme] || {
    primary: 'text-sky-700',
    bgPrimary: 'bg-sky-700',
    bgLight: 'bg-sky-50',
    borderPrimary: 'border-sky-700',
    borderLight: 'border-sky-200',
    accentDot: 'bg-sky-600',
  };

  return (
    <div className="w-full bg-white text-slate-800 shadow-sm print:shadow-none min-h-[1050px] p-8 md:p-10 font-sans text-[13px] leading-relaxed">
      {/* Top Header / Hero */}
      <header className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {visibleSections.photo && personal.showPhoto && personal.photoUrl && (
              <div
                className="shrink-0 relative group cursor-pointer"
                onClick={onEditPhoto}
                title="Haz clic para cambiar la foto de perfil"
              >
                <img
                  src={personal.photoUrl}
                  alt={personal.fullName}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-lg object-cover border border-slate-200 shadow-xs group-hover:opacity-90 transition-opacity"
                />
                {onEditPhoto && (
                  <div className="absolute inset-0 bg-slate-900/50 rounded-lg flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity no-print">
                    <span className="text-sm">📷</span>
                    <span className="text-[10px] font-medium mt-0.5">Cambiar</span>
                  </div>
                )}
              </div>
            )}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                  {personal.fullName}
                </h1>
              </div>
              <p className={`text-base font-semibold ${colorMap.primary} mt-1`}>
                {personal.headline} <span className="text-slate-400 font-normal">|</span> {personal.yearsExperience}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {personal.street}, {personal.postalCode} {personal.city} ({personal.district})
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {personal.phonePrimary} / {personal.phoneSecondary}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${personal.email}`} className="hover:underline text-slate-700">
                    {personal.email}
                  </a>
                </span>
                {personal.linkedin && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`https://${personal.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline text-slate-700">
                        {personal.linkedin}
                      </a>
                    </span>
                  </>
                )}
                {personal.dni && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span>DNI: {personal.dni}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="md:text-right shrink-0 flex flex-col justify-between pt-1 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-2.5 max-w-[240px]">
              <span className="font-semibold text-slate-900 block mb-0.5">Disponibilidad</span>
              <p className="text-slate-600">{personal.availability}</p>
              <p className="text-slate-500 text-[11px] mt-1 italic">{personal.billingPreference}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main 2-Column Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Main Column (Experience & Competencies) */}
        <div className="md:col-span-8 space-y-6">
          {/* Summary / Extracto */}
          {visibleSections.summary && (
            <section>
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-2 flex items-center gap-2`}>
                <Sparkles className="w-3.5 h-3.5" />
                Perfil Profesional
              </h2>
              <p className="text-slate-700 text-justify text-xs/relaxed border-l-2 border-slate-200 pl-3 py-0.5">
                {summary}
              </p>
            </section>
          )}

          {/* Core Competencies */}
          {visibleSections.competencies && coreCompetencies.length > 0 && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-3 flex items-center gap-2`}>
                <Award className="w-3.5 h-3.5" />
                Habilidades & Capacidades Clave
              </h2>
              <div className="space-y-3">
                {coreCompetencies.map((comp, idx) => (
                  <div key={idx} className="bg-slate-50/70 border border-slate-200/80 rounded-md p-3">
                    <h3 className="font-semibold text-slate-900 text-xs mb-1.5 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${colorMap.accentDot}`} />
                      {comp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mb-1">
                      <strong className="text-slate-700 font-medium">Habilidades:</strong> {comp.skills}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-700 font-medium">Logros:</strong> {comp.achievements}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Detailed Experience / Proyectos Destacados */}
          {visibleSections.experience && (
            <section>
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-4 flex items-center gap-2`}>
                <Briefcase className="w-3.5 h-3.5" />
                Experiencia Laboral y Proyectos Destacados
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l border-slate-200 page-break-avoid pb-1">
                    <span className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${colorMap.bgPrimary}`} />
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-xs">
                        {exp.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500 font-medium">
                        {exp.period}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-1.5">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      <span>{exp.company}</span>
                      {exp.roleTitle && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">{exp.roleTitle}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2">
                      {exp.description}
                    </p>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="text-[11.5px] text-slate-600 space-y-1 mb-2 list-disc list-inside">
                        {exp.highlights.map((item, hIdx) => (
                          <li key={hIdx}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {exp.technologies.map((tech, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10.5px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            {tech}
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

        {/* Right Sidebar Column (Tech Stack, Education, Languages, Qualities) */}
        <div className="md:col-span-4 space-y-6">
          {/* Tech Stack */}
          {visibleSections.technologies && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-3 flex items-center gap-2`}>
                <Code2 className="w-3.5 h-3.5" />
                Tecnología & Herramientas
              </h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <h4 className="text-[11.5px] font-semibold text-slate-900 uppercase tracking-wide mb-1.5">
                    Software Open Source & Java
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {technologies.openSource.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11.5px] font-semibold text-slate-900 uppercase tracking-wide mb-1.5">
                    Software Comercial & ERP
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {technologies.commercialSoftware.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11.5px] font-semibold text-slate-900 uppercase tracking-wide mb-1.5">
                    Metodologías & Testing
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {technologies.methodologies.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11.5px] font-semibold text-slate-900 uppercase tracking-wide mb-1.5">
                    Herramientas Colaborativas & CI/CD
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {technologies.collaborativeTools.map((item, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Education & Certifications */}
          {visibleSections.education && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-3 flex items-center gap-2`}>
                <GraduationCap className="w-3.5 h-3.5" />
                Formación & Certificaciones
              </h2>
              <div className="space-y-2.5 text-xs">
                {education.map((edu) => (
                  <div key={edu.id} className="pb-2 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-500">
                      <span>{edu.year}</span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-xs mt-0.5">
                      {edu.title}
                    </h4>
                    {edu.institution && (
                      <p className="text-[11px] text-slate-500">{edu.institution}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {visibleSections.languages && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-3 flex items-center gap-2`}>
                <Globe className="w-3.5 h-3.5" />
                Idiomas
              </h2>
              <div className="space-y-2 text-xs">
                {languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-1 border-b border-slate-100 last:border-b-0">
                    <span className="font-semibold text-slate-800">{lang.language}</span>
                    <span className="text-slate-500 text-[11.5px]">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Qualities / Soft Skills */}
          {visibleSections.qualities && qualities.length > 0 && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-3 flex items-center gap-2`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cualidades Destacadas
              </h2>
              <div className="space-y-1.5 text-xs">
                {qualities.map((q, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700">
                    <span className={`w-1.5 h-1.5 rounded-full ${colorMap.accentDot} shrink-0`} />
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Other info */}
          {visibleSections.otherInfo && otherInfo.length > 0 && (
            <section className="page-break-avoid">
              <h2 className={`text-xs font-bold uppercase tracking-wider ${colorMap.primary} mb-2`}>
                Otros Datos de Interés
              </h2>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {otherInfo.map((info, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-slate-400">·</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
