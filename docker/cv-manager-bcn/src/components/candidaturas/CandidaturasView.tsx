import React, { useState, useMemo } from 'react';
import { Candidatura, ApplicationStatus, PortalSource, Modality } from '../../types';
import { CandidaturaModal } from './CandidaturaModal';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Calendar,
  Clock,
  Building2,
  MapPin,
  User,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Upload,
} from 'lucide-react';
import { UserProfileAccount } from '../../types';

interface Props {
  candidaturas: Candidatura[];
  activeProfile: UserProfileAccount;
  onUpdateCandidaturas: (updated: Candidatura[]) => void;
  onSelectForEdit?: (candidatura: Candidatura) => void;
  profiles?: UserProfileAccount[];
}

export const CandidaturasView: React.FC<Props> = ({
  candidaturas,
  activeProfile,
  onUpdateCandidaturas,
  profiles = [],
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [portalFilter, setPortalFilter] = useState<string>('all');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [profileScopeFilter, setProfileScopeFilter] = useState<'active_only' | 'all'>('active_only');

  const [selectedCandidatura, setSelectedCandidatura] = useState<Candidatura | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status column taxonomy for Kanban
  const kanbanColumns: Array<{
    id: ApplicationStatus | 'entrevistas_group';
    title: string;
    description: string;
    matchStatuses: ApplicationStatus[];
    badgeClass: string;
  }> = [
    {
      id: 'enviada',
      title: 'Enviadas',
      description: 'CV enviado a la espera de primer contacto',
      matchStatuses: ['enviada', 'en_espera'],
      badgeClass: 'text-slate-600',
    },
    {
      id: 'en_revision',
      title: 'En Revisión',
      description: 'CV en manos del equipo técnico o RRHH',
      matchStatuses: ['en_revision'],
      badgeClass: 'text-amber-700',
    },
    {
      id: 'entrevistas_group',
      title: 'En Entrevistas',
      description: 'Procesos con entrevistas activas o pruebas',
      matchStatuses: ['entrevista_rrhh', 'prueba_tecnica', 'entrevista_final'],
      badgeClass: 'text-sky-700',
    },
    {
      id: 'oferta',
      title: 'Oferta Recibida',
      description: 'Propuestas formales para evaluar',
      matchStatuses: ['oferta'],
      badgeClass: 'text-emerald-700',
    },
    {
      id: 'descartada',
      title: 'Descartadas',
      description: 'Procesos finalizados o no ajustados',
      matchStatuses: ['descartada'],
      badgeClass: 'text-rose-700',
    },
  ];

  // Filtering
  const filteredCandidaturas = useMemo(() => {
    return candidaturas.filter((cand) => {
      const matchesSearch =
        cand.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || cand.status === statusFilter;

      const matchesPortal =
        portalFilter === 'all' || cand.portalSource === portalFilter;

      const matchesModality =
        modalityFilter === 'all' || cand.modality === modalityFilter;

      const matchesProfile =
        profileScopeFilter === 'all' ||
        !cand.profileId ||
        cand.profileId === activeProfile.id;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPortal &&
        matchesModality &&
        matchesProfile
      );
    });
  }, [
    candidaturas,
    searchTerm,
    statusFilter,
    portalFilter,
    modalityFilter,
    profileScopeFilter,
    activeProfile.id,
  ]);

  // Metrics calculation
  const metrics = useMemo(() => {
    const relevantCands = candidaturas.filter(
      (c) => profileScopeFilter === 'all' || !c.profileId || c.profileId === activeProfile.id
    );
    const total = relevantCands.length;
    const inInterviews = relevantCands.filter((c) =>
      ['entrevista_rrhh', 'prueba_tecnica', 'entrevista_final'].includes(c.status)
    ).length;
    const inReview = relevantCands.filter((c) => c.status === 'en_revision').length;
    const offers = relevantCands.filter((c) => c.status === 'oferta').length;
    const totalInterviewsScheduled = relevantCands.reduce(
      (acc, c) => acc + c.interviews.filter((i) => !i.completed).length,
      0
    );

    return { total, inInterviews, inReview, offers, totalInterviewsScheduled };
  }, [candidaturas, profileScopeFilter, activeProfile.id]);

  // Handlers
  const handleSaveCandidatura = (saved: Candidatura) => {
    const savedWithProfile: Candidatura = {
      ...saved,
      profileId: saved.profileId || activeProfile.id,
    };
    const exists = candidaturas.some((c) => c.id === savedWithProfile.id);
    if (exists) {
      onUpdateCandidaturas(
        candidaturas.map((c) => (c.id === savedWithProfile.id ? savedWithProfile : c))
      );
    } else {
      onUpdateCandidaturas([savedWithProfile, ...candidaturas]);
    }
    setIsModalOpen(false);
    setSelectedCandidatura(null);
  };

  const handleDeleteCandidatura = (id: string) => {
    onUpdateCandidaturas(candidaturas.filter((c) => c.id !== id));
  };

  const handleStatusChange = (id: string, newStatus: ApplicationStatus) => {
    onUpdateCandidaturas(
      candidaturas.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'Empresa',
      'Puesto',
      'Estado',
      'Ubicación',
      'Modalidad',
      'Portal',
      'Fecha Envio',
      'Contacto Nombre',
      'Contacto Email',
      'Contacto Tel',
      'Salario',
      'Entrevistas Totales',
      'Notas',
    ];

    const rows = candidaturas.map((c) => [
      `"${c.company.replace(/"/g, '""')}"`,
      `"${c.role.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.location}"`,
      `"${c.modality}"`,
      `"${c.portalSource}"`,
      `"${c.applicationDate}"`,
      `"${c.contactPerson?.name || ''}"`,
      `"${c.contactPerson?.email || ''}"`,
      `"${c.contactPerson?.phone || ''}"`,
      `"${c.salaryDiscussed || c.salaryRange || ''}"`,
      `"${c.interviews.length}"`,
      `"${(c.generalNotes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Candidaturas_DavidCortes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Helper for portal labels
  const getPortalLabel = (p: PortalSource) => {
    switch (p) {
      case 'infojobs':
        return 'InfoJobs';
      case 'linkedin':
        return 'LinkedIn';
      case 'indeed':
        return 'Indeed';
      case 'barcelona_activa':
        return 'Barcelona Activa';
      case 'feina_activa_soc':
        return 'SOC Feina Activa';
      case 'tecnoempleo':
        return 'Tecnoempleo';
      case 'directo_empresa':
        return 'Directo Empresa';
      default:
        return 'Portal Empleo';
    }
  };

  const getStatusLabel = (s: ApplicationStatus) => {
    switch (s) {
      case 'enviada':
        return 'Enviada';
      case 'en_revision':
        return 'En revisión';
      case 'entrevista_rrhh':
        return 'Entrevista RRHH';
      case 'prueba_tecnica':
        return 'Prueba Técnica';
      case 'entrevista_final':
        return 'Entrevista Final';
      case 'oferta':
        return 'Oferta Recibida';
      case 'descartada':
        return 'Descartada';
      case 'en_espera':
        return 'En reserva';
      default:
        return s;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Candidaturas Activas
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {metrics.total}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Total registradas</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">
            En Revisión
          </span>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {metrics.inReview}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Evaluando CV</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-sky-700 uppercase tracking-wide">
            En Entrevistas
          </span>
          <div className="text-2xl font-bold text-sky-700 font-mono tabular-nums mt-1">
            {metrics.inInterviews}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Procesos avanzados</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
            Ofertas Recibidas
          </span>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums mt-1">
            {metrics.offers}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Para evaluar</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-slate-600 uppercase tracking-wide">
            Próximas Citas
          </span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {metrics.totalInterviewsScheduled}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Pendientes de celebrar</span>
        </div>
      </div>

      {/* Control Bar: Filters, Search, View Switcher, and Add Button */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, puesto, tecnología (ej: Liferay, CaixaBank, Les Corts)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded focus:outline-sky-600 bg-white placeholder-slate-400"
            />
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-50 text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Tablero Kanban"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Vista Detallada / Tabla"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              title="Exportar candidaturas a CSV Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Exportar CSV</span>
            </button>

            <button
              onClick={() => {
                setSelectedCandidatura(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded hover:bg-slate-800 flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Candidatura</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Filtros:
          </span>

          {/* Profile Scope Toggle */}
          <div className="flex items-center border border-slate-200 rounded p-0.5 bg-slate-100 text-xs">
            <button
              type="button"
              onClick={() => setProfileScopeFilter('active_only')}
              className={`px-2 py-0.5 rounded transition-colors text-[11px] font-medium ${
                profileScopeFilter === 'active_only'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              De {activeProfile.name.split(' ')[0]}
            </button>
            <button
              type="button"
              onClick={() => setProfileScopeFilter('all')}
              className={`px-2 py-0.5 rounded transition-colors text-[11px] font-medium ${
                profileScopeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos los perfiles
            </button>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-50 text-slate-700 focus:outline-sky-600"
          >
            <option value="all">Todos los estados ({candidaturas.length})</option>
            <option value="enviada">Enviadas</option>
            <option value="en_revision">En revisión</option>
            <option value="entrevista_rrhh">Entrevista RRHH</option>
            <option value="prueba_tecnica">Prueba Técnica</option>
            <option value="entrevista_final">Entrevista Final</option>
            <option value="oferta">Ofertas</option>
            <option value="descartada">Descartadas</option>
          </select>

          <select
            value={portalFilter}
            onChange={(e) => setPortalFilter(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-50 text-slate-700 focus:outline-sky-600"
          >
            <option value="all">Todos los portales</option>
            <option value="infojobs">InfoJobs</option>
            <option value="linkedin">LinkedIn</option>
            <option value="indeed">Indeed</option>
            <option value="barcelona_activa">Barcelona Activa</option>
            <option value="feina_activa_soc">SOC Feina Activa</option>
            <option value="tecnoempleo">Tecnoempleo</option>
          </select>

          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="border border-slate-200 rounded px-2 py-1 text-xs bg-slate-50 text-slate-700 focus:outline-sky-600"
          >
            <option value="all">Todas las modalidades</option>
            <option value="hibrido">Híbrido</option>
            <option value="presencial">Presencial (Barcelona)</option>
            <option value="remoto">100% Remoto</option>
          </select>

          {(searchTerm || statusFilter !== 'all' || portalFilter !== 'all' || modalityFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPortalFilter('all');
                setModalityFilter('all');
              }}
              className="text-[11px] text-sky-700 hover:underline font-medium ml-auto"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Main View Area: Kanban vs Table */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnItems = filteredCandidaturas.filter((cand) =>
              col.matchStatuses.includes(cand.status)
            );

            return (
              <div
                key={col.id}
                className="bg-slate-100/70 border border-slate-200 rounded-lg p-3 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <h3 className={`text-xs font-bold ${col.badgeClass}`}>
                      {col.title}
                    </h3>
                    <span className="text-[11px] font-mono tabular-nums bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600">
                      {columnItems.length}
                    </span>
                  </div>
                </div>

                {/* Column Items */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {columnItems.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      Sin candidaturas en esta etapa
                    </div>
                  ) : (
                    columnItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedCandidatura(item);
                          setIsModalOpen(true);
                        }}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-3.5 shadow-xs hover:shadow-sm transition-all cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10.5px] font-mono text-slate-500">
                            {getPortalLabel(item.portalSource)}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded uppercase font-medium">
                            {item.modality}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                            {item.role}
                          </h4>
                          <p className="text-xs font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {item.company}
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-100">
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </p>

                          {item.contactPerson?.name && (
                            <p className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.contactPerson.name} ({item.contactPerson.role || 'RRHH'})</span>
                            </p>
                          )}
                        </div>

                        {/* Interview indicator */}
                        {item.interviews.length > 0 && (
                          <div className="bg-sky-50 border border-sky-100 rounded p-1.5 text-[11px] text-sky-800 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-sky-600" />
                              <span>{item.interviews.length} ronda(s)</span>
                            </span>
                            <span className="text-[10px] font-mono">
                              {item.interviews.filter((i) => i.completed).length}/{item.interviews.length} hechas
                            </span>
                          </div>
                        )}

                        {/* Follow up reminder */}
                        {item.followUpDate && (
                          <div className="text-[10.5px] text-amber-700 flex items-center gap-1 pt-0.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>Seguimiento: {item.followUpDate}</span>
                          </div>
                        )}

                        {/* Quick state selector */}
                        <div
                          className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-slate-400 text-[10px]">Mover a:</span>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as ApplicationStatus)}
                            className="text-[10.5px] border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-slate-700"
                          >
                            <option value="enviada">Enviada</option>
                            <option value="en_revision">En revisión</option>
                            <option value="entrevista_rrhh">Entr. RRHH</option>
                            <option value="prueba_tecnica">P. Técnica</option>
                            <option value="entrevista_final">Entr. Final</option>
                            <option value="oferta">Oferta 🎉</option>
                            <option value="descartada">Descartada</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10.5px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Puesto y Empresa</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Ubicación / Modalidad</th>
                  <th className="py-3 px-3">Portal</th>
                  <th className="py-3 px-3">Contacto Directo</th>
                  <th className="py-3 px-3">Entrevistas</th>
                  <th className="py-3 px-3">Salario / Tarifa</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCandidaturas.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedCandidatura(item);
                      setIsModalOpen(true);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.role}</div>
                      <div className="text-[11px] text-slate-500">{item.company}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] font-medium text-slate-700">
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800">{item.location}</div>
                      <div className="text-[10.5px] text-slate-400 capitalize">{item.modality}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {getPortalLabel(item.portalSource)}
                    </td>
                    <td className="py-3 px-3">
                      {item.contactPerson?.name ? (
                        <div>
                          <div className="font-medium text-slate-800">{item.contactPerson.name}</div>
                          <div className="text-[10.5px] text-slate-400">{item.contactPerson.email || item.contactPerson.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No especificado</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                        {item.interviews.length} ronda(s)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      {item.salaryDiscussed || item.salaryRange || <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCandidatura(item);
                          setIsModalOpen(true);
                        }}
                        className="text-sky-700 hover:underline font-semibold"
                      >
                        Ver / Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidatura Modal */}
      <CandidaturaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidatura(null);
        }}
        candidatura={selectedCandidatura}
        onSave={handleSaveCandidatura}
        onDelete={handleDeleteCandidatura}
        activeProfile={activeProfile}
        profiles={profiles}
      />
    </div>
  );
};
