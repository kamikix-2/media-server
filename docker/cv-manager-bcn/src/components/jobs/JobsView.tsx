import React, { useState, useMemo } from 'react';
import { JobOffer, Candidatura, PortalSource, Modality, UserProfileAccount } from '../../types';
import { AddJobModal } from './AddJobModal';
import {
  Search,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  Filter,
  Briefcase,
  Compass,
  Navigation,
  Globe,
  SlidersHorizontal,
  BookmarkCheck,
  Send,
  Sparkles,
  Plus,
  RotateCcw,
  Tag,
  ArrowUpDown,
  Check,
  X,
  AlertCircle,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface Props {
  offers: JobOffer[];
  candidaturas: Candidatura[];
  activeProfile: UserProfileAccount;
  onAddOfferToCandidaturas: (offer: JobOffer) => void;
  onAddNewCustomOffer: (newOffer: JobOffer) => void;
}

// Helper to remove accents and normalize text for fault-tolerant Spanish search
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Helper to extract word stem for gender/plural agnostic matching
// e.g. "administrativo" -> "administrativ", matching "administrativa", "administración", etc.
function getStem(word: string): string {
  const norm = normalizeText(word);
  if (norm.length <= 4) return norm;
  // Remove common endings: os, as, es, o, a, e, ción -> c
  if (norm.endsWith('cion')) return norm.slice(0, -4) + 'c';
  if (norm.endsWith('es') || norm.endsWith('os') || norm.endsWith('as')) return norm.slice(0, -2);
  if (norm.endsWith('o') || norm.endsWith('a') || norm.endsWith('e')) return norm.slice(0, -1);
  return norm;
}

// Helper to parse distance in kilometers from strings like "A 500m", "A 1,2 km", "Remoto 100%"
function parseDistanceKm(distanceStr: string): number {
  if (!distanceStr) return 999;
  const norm = distanceStr.toLowerCase();
  if (norm.includes('remoto')) return 0;
  if (norm.includes('km')) {
    const match = norm.match(/(\d+([,\.]\d+)?)\s*km/);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
  }
  if (norm.includes('m')) {
    const match = norm.match(/(\d+)\s*m/);
    if (match) {
      return parseInt(match[1], 10) / 1000;
    }
  }
  return 999;
}

export const JobsView: React.FC<Props> = ({
  offers,
  candidaturas,
  activeProfile,
  onAddOfferToCandidaturas,
  onAddNewCustomOffer,
}) => {
  // Free text search in unified feed (Default empty so all offers are displayed)
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Category / Professional Area filter
  // Default to 'all' so no offers are hidden by default!
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'administrative' | 'it_tech' | 'profile_recommendation'>('all');

  // 2. Zone Filter (Presets + Custom free text)
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [customZoneText, setCustomZoneText] = useState<string>('');

  // 3. Distance Radius from Les Corts
  const [distancePreset, setDistancePreset] = useState<'all' | 'walk' | 'metro' | 'city' | 'remote' | 'custom'>('all');
  const [customMaxKm, setCustomMaxKm] = useState<string>('');

  // 4. Portals Multi-select: user can select any subset of portals
  const allPortalIds: PortalSource[] = [
    'infojobs',
    'linkedin',
    'indeed',
    'barcelona_activa',
    'feina_activa_soc',
    'tecnoempleo',
  ];
  const [selectedPortals, setSelectedPortals] = useState<Set<PortalSource>>(new Set(allPortalIds));

  // 5. Modality Multi-select
  const allModalities: Modality[] = ['presencial', 'hibrido', 'remoto'];
  const [selectedModalities, setSelectedModalities] = useState<Set<Modality>>(new Set(allModalities));

  // 6. Contract Type Multi-select
  const allContractTypes = ['indefinido', 'autonomo_b2b', 'temporal'];
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set(allContractTypes));

  // 7. Salary filter (Preset + Custom input)
  const [salaryPreset, setSalaryPreset] = useState<'all' | '25k' | '30k' | '35k' | '45k' | 'b2b_day' | 'custom'>('all');
  const [customMinSalary, setCustomMinSalary] = useState<string>('');

  // 8. Sorting
  const [sortBy, setSortBy] = useState<'distance' | 'salary' | 'recent' | 'company'>('distance');

  // Multi-portal external launchpad search term
  const [portalSearchTerm, setPortalSearchTerm] = useState(
    activeProfile.category === 'administrative'
      ? 'Administrativo Barcelona'
      : 'Java Liferay Barcelona'
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addedOfferIds, setAddedOfferIds] = useState<Set<string>>(new Set());
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Quick suggestion tags based on active profile & general categories
  const quickTags = useMemo(() => {
    if (activeProfile.category === 'administrative') {
      return ['Administrativo', 'Asistente Dirección', 'CAE', 'Facturación', 'Proveedores', 'Català C1', 'Les Corts', 'Diagonal'];
    }
    return ['Liferay DXP', 'Java', 'Spring Boot', 'Banca', 'Les Corts', 'Diagonal', 'Autónomo B2B', 'Microservicios'];
  }, [activeProfile.category]);

  // Portals configuration with direct search URLs pre-filtered to Barcelona
  const portalsList = [
    {
      id: 'infojobs',
      name: 'InfoJobs',
      description: 'Líder en España. Ofertas en Barcelona y Les Corts.',
      badgeClass: 'text-blue-700 bg-blue-50 border-blue-200',
      getUrl: (term: string) =>
        `https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=${encodeURIComponent(term)}&provinceIds=8`,
    },
    {
      id: 'linkedin',
      name: 'LinkedIn Jobs',
      description: 'Gran volumen corporativo y perfiles senior en BCN.',
      badgeClass: 'text-sky-700 bg-sky-50 border-sky-200',
      getUrl: (term: string) =>
        `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(term)}&location=Barcelona%2C%20Catalonia%2C%20Spain`,
    },
    {
      id: 'indeed',
      name: 'Indeed España',
      description: 'Metabuscador con agregación de cientos de portales.',
      badgeClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      getUrl: (term: string) =>
        `https://es.indeed.com/jobs?q=${encodeURIComponent(term)}&l=Barcelona`,
    },
    {
      id: 'barcelona_activa',
      name: 'Treball Barcelona Activa',
      description: 'Portal oficial del Ajuntament de Barcelona para empleo local.',
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
      getUrl: (term: string) =>
        `https://treball.barcelonactiva.cat/porta22/cat/altres/cercador_ofertes.jsp`,
    },
    {
      id: 'feina_activa_soc',
      name: 'Feina Activa (SOC - Generalitat)',
      description: 'Portal oficial de la Generalitat de Catalunya y SEPE.',
      badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
      getUrl: (term: string) =>
        `https://feinaactiva.gencat.cat/ofertes-treball?cercar=${encodeURIComponent(term)}&ambit=BARCELONA`,
    },
    {
      id: 'tecnoempleo',
      name: 'Tecnoempleo / Ticjob',
      description: 'Especializado en perfiles tecnológicos y contratos autónomos B2B.',
      badgeClass: 'text-teal-700 bg-teal-50 border-teal-200',
      getUrl: (term: string) =>
        `https://www.tecnoempleo.com/ofertas-trabajo-liferay-barcelona.aspx`,
    },
  ];

  // Map of companies and roles already in candidaturas to show "Añadida" status
  const candidatureCompanyRoleMap = useMemo(() => {
    const set = new Set<string>();
    candidaturas.forEach((c) => {
      set.add(`${c.company.toLowerCase().trim()}|${c.role.toLowerCase().trim()}`);
    });
    return set;
  }, [candidaturas]);

  // Offers category counts
  const categoryCounts = useMemo(() => {
    let admin = 0;
    let it = 0;
    offers.forEach((o) => {
      if (o.targetCategory === 'administrative') admin++;
      else if (o.targetCategory === 'it_tech') it++;
    });
    return {
      all: offers.length,
      admin,
      it,
    };
  }, [offers]);

  // Robust Filtering Engine
  const filteredOffers = useMemo(() => {
    return offers
      .filter((job) => {
        // 1. Text Search with accent-insensitivity and stem matching
        if (searchQuery.trim()) {
          const rawTokens = searchQuery.trim().split(/\s+/).filter(Boolean);
          const searchableText = `${job.title} ${job.company} ${job.description} ${job.zone} ${job.location} ${job.portal} ${job.keySkills.join(' ')} ${job.salary} ${job.modality} ${job.contractType}`;
          const normalizedSearchable = normalizeText(searchableText);

          // Every token must match in the searchable text either directly or through stem
          const tokensMatch = rawTokens.every((token) => {
            const normToken = normalizeText(token);
            if (normalizedSearchable.includes(normToken)) return true;
            const stem = getStem(normToken);
            if (stem.length >= 3 && normalizedSearchable.includes(stem)) return true;
            return false;
          });

          if (!tokensMatch) return false;
        }

        // 2. Category / Area Filter
        if (categoryFilter === 'profile_recommendation') {
          if (job.targetCategory && job.targetCategory !== 'all' && job.targetCategory !== activeProfile.category) {
            return false;
          }
        } else if (categoryFilter === 'administrative') {
          if (job.targetCategory !== 'administrative' && job.targetCategory !== 'all') {
            return false;
          }
        } else if (categoryFilter === 'it_tech') {
          if (job.targetCategory !== 'it_tech' && job.targetCategory !== 'all') {
            return false;
          }
        }
        // 'all' passes everything!

        // 3. Portals Filter (Multi-select)
        if (!selectedPortals.has(job.portal)) {
          return false;
        }

        // 4. Modality Filter (Multi-select)
        if (!selectedModalities.has(job.modality)) {
          return false;
        }

        // 5. Contract Type Filter (Multi-select)
        if (!selectedContracts.has(job.contractType)) {
          return false;
        }

        // 6. Zone / Barrio Filter
        if (customZoneText.trim()) {
          const normZoneInput = normalizeText(customZoneText.trim());
          const normJobZone = normalizeText(`${job.zone} ${job.location} ${job.distanceFromLesCorts}`);
          if (!normJobZone.includes(normZoneInput)) {
            return false;
          }
        } else if (selectedZone !== 'all') {
          const normJobZone = normalizeText(`${job.zone} ${job.location}`);
          if (selectedZone === 'les_corts' && !normJobZone.includes('les corts') && !normJobZone.includes('sentmenat') && !normJobZone.includes('comas') && !normJobZone.includes('dexeus')) return false;
          if (selectedZone === 'diagonal' && !normJobZone.includes('diagonal') && !normJobZone.includes('maria cristina') && !normJobZone.includes('pedralbes')) return false;
          if (selectedZone === 'sants' && !normJobZone.includes('sants') && !normJobZone.includes('espanya') && !normJobZone.includes('vallespir')) return false;
          if (selectedZone === 'eixample' && !normJobZone.includes('eixample') && !normJobZone.includes('maternitat') && !normJobZone.includes('clinic')) return false;
          if (selectedZone === 'poblenou' && !normJobZone.includes('poblenou') && !normJobZone.includes('22@')) return false;
          if (selectedZone === 'sarria' && !normJobZone.includes('sarria') && !normJobZone.includes('bonanova')) return false;
          if (selectedZone === 'remoto' && job.modality !== 'remoto') return false;
        }

        // 7. Distance Radius Filter
        const distKm = parseDistanceKm(job.distanceFromLesCorts);
        if (distancePreset === 'walk') {
          // Less than 1 km
          if (job.modality !== 'remoto' && distKm > 1.0) return false;
        } else if (distancePreset === 'metro') {
          // Less than 2 km
          if (job.modality !== 'remoto' && distKm > 2.0) return false;
        } else if (distancePreset === 'city') {
          // Less than 5 km
          if (job.modality !== 'remoto' && distKm > 5.0) return false;
        } else if (distancePreset === 'remote') {
          if (job.modality !== 'remoto') return false;
        } else if (distancePreset === 'custom' && customMaxKm.trim()) {
          const maxVal = parseFloat(customMaxKm.replace(',', '.'));
          if (!isNaN(maxVal) && distKm > maxVal && job.modality !== 'remoto') return false;
        }

        // 8. Salary Filter
        let minRequiredAmount = 0;
        let isB2BDay = false;

        if (salaryPreset === '25k') minRequiredAmount = 25000;
        else if (salaryPreset === '30k') minRequiredAmount = 30000;
        else if (salaryPreset === '35k') minRequiredAmount = 35000;
        else if (salaryPreset === '45k') minRequiredAmount = 45000;
        else if (salaryPreset === 'b2b_day') isB2BDay = true;
        else if (salaryPreset === 'custom' && customMinSalary.trim()) {
          const num = parseInt(customMinSalary.replace(/\D/g, ''), 10);
          if (!isNaN(num)) minRequiredAmount = num;
        }

        if (isB2BDay) {
          if (!job.salary.includes('/ día') && !job.salary.includes('autónomo') && job.contractType !== 'autonomo_b2b') {
            return false;
          }
        } else if (minRequiredAmount > 0) {
          const digits = job.salary.replace(/\./g, '').match(/\d{4,6}/g);
          if (digits && digits.length > 0) {
            const highestNumber = Math.max(...digits.map(Number));
            if (highestNumber < minRequiredAmount) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'distance') {
          return parseDistanceKm(a.distanceFromLesCorts) - parseDistanceKm(b.distanceFromLesCorts);
        }
        if (sortBy === 'company') {
          return a.company.localeCompare(b.company);
        }
        if (sortBy === 'salary') {
          const getSal = (s: string) => {
            const m = s.replace(/\./g, '').match(/\d{4,6}/g);
            return m ? Math.max(...m.map(Number)) : 0;
          };
          return getSal(b.salary) - getSal(a.salary);
        }
        return 0; // recent by default
      });
  }, [
    offers,
    searchQuery,
    categoryFilter,
    selectedPortals,
    selectedModalities,
    selectedContracts,
    selectedZone,
    customZoneText,
    distancePreset,
    customMaxKm,
    salaryPreset,
    customMinSalary,
    sortBy,
    activeProfile.category,
  ]);

  // Check if any filters are actively restricting
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'all' ||
    selectedZone !== 'all' ||
    customZoneText.trim() !== '' ||
    distancePreset !== 'all' ||
    customMaxKm.trim() !== '' ||
    selectedPortals.size < allPortalIds.length ||
    selectedModalities.size < allModalities.length ||
    selectedContracts.size < allContractTypes.length ||
    salaryPreset !== 'all' ||
    customMinSalary.trim() !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setSelectedZone('all');
    setCustomZoneText('');
    setDistancePreset('all');
    setCustomMaxKm('');
    setSelectedPortals(new Set(allPortalIds));
    setSelectedModalities(new Set(allModalities));
    setSelectedContracts(new Set(allContractTypes));
    setSalaryPreset('all');
    setCustomMinSalary('');
    setSortBy('distance');
  };

  const togglePortal = (portalId: PortalSource) => {
    const next = new Set(selectedPortals);
    if (next.has(portalId)) {
      if (next.size > 1) next.delete(portalId); // Keep at least one
    } else {
      next.add(portalId);
    }
    setSelectedPortals(next);
  };

  const toggleModality = (mod: Modality) => {
    const next = new Set(selectedModalities);
    if (next.has(mod)) {
      if (next.size > 1) next.delete(mod);
    } else {
      next.add(mod);
    }
    setSelectedModalities(next);
  };

  const toggleContract = (ct: string) => {
    const next = new Set(selectedContracts);
    if (next.has(ct)) {
      if (next.size > 1) next.delete(ct);
    } else {
      next.add(ct);
    }
    setSelectedContracts(next);
  };

  const handleAddAndNotify = (offer: JobOffer) => {
    onAddOfferToCandidaturas(offer);
    setAddedOfferIds((prev) => new Set([...prev, offer.id]));
  };

  const handleOpenSearchOnPortal = (getUrl: (term: string) => string) => {
    const url = getUrl(portalSearchTerm);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-5">
      {/* Header Context Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Bolsa y Buscador de Ofertas de Empleo
              </h1>
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium border border-slate-200 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-700" />
                Barcelona · Les Corts (08029)
              </span>
              <span className="text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-semibold border border-sky-200">
                {offers.length} ofertas en base de datos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Buscador unificado con filtros 100% personalizables (palabras clave con búsqueda flexible, zona, radio en km, portales oficiales, modalidad y salario) adaptado a Barcelona y Les Corts.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors whitespace-nowrap active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>+ Añadir Oferta Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Portal Launchpad: Instant external searches */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Lanzador de Búsqueda Externa en Portales Oficiales
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Pre-configurado con ubicación Barcelona
          </span>
        </div>

        {/* Search bar for launching on portals */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={portalSearchTerm}
              onChange={(e) => setPortalSearchTerm(e.target.value)}
              placeholder="Término para buscar en los portales externos (ej: Administrativo Les Corts, Java Spring)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-sky-600 bg-white"
            />
          </div>

          <button
            onClick={() => {
              portalsList.forEach((p) => {
                window.open(p.getUrl(portalSearchTerm), '_blank', 'noopener,noreferrer');
              });
            }}
            className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
            title="Abrir búsqueda en los 6 portales a la vez en pestañas independientes"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir los 6 Portales a la Vez</span>
          </button>
        </div>

        {/* 6 Portal cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {portalsList.map((portal) => (
            <div
              key={portal.id}
              onClick={() => handleOpenSearchOnPortal(portal.getUrl)}
              className="border border-slate-200 hover:border-slate-300 rounded-lg p-2.5 bg-slate-50/70 hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-sky-700 transition-colors">
                    {portal.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700" />
                </div>
                <p className="text-[10.5px] text-slate-500 leading-tight">
                  {portal.description}
                </p>
              </div>
              <span className="text-[10.5px] text-sky-700 font-semibold mt-2 block group-hover:underline">
                Buscar en portal →
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fully Customizable Filter Panel for Unified Feed */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Panel Header with Offer Counter & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-700" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Filtros Personalizables del Panel
            </h2>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-[11px] text-slate-500 hover:text-slate-800 ml-2 font-medium"
            >
              {showAdvancedFilters ? '(Ocultar filtros)' : '(Mostrar filtros)'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restablecer filtros</span>
              </button>
            )}
            <span className="text-slate-700 font-mono text-xs tabular-nums bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 font-semibold">
              <strong>{filteredOffers.length}</strong> {filteredOffers.length === 1 ? 'oferta visible' : 'ofertas visibles'} (de {offers.length})
            </span>
          </div>
        </div>

        {/* 1. Main Search Input (Full text, accent-insensitive & stem-matching) */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por palabras clave (ej: administrativo, secretaria, facturación, compras, Java, Liferay, CaixaBank, Planeta)..."
            className="w-full pl-9 pr-8 py-2 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-sky-600 bg-white placeholder-slate-400 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 text-sm font-bold"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Quick Search Tag Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" />
            Sugerencias rápidas:
          </span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                if (searchQuery.toLowerCase().includes(tag.toLowerCase())) {
                  setSearchQuery(searchQuery.replace(new RegExp(tag, 'gi'), '').trim());
                } else {
                  setSearchQuery(searchQuery ? `${searchQuery} ${tag}` : tag);
                }
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                searchQuery.toLowerCase().includes(tag.toLowerCase())
                  ? 'bg-sky-700 text-white border-sky-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Category Segmented Selector */}
        <div className="pt-1">
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
            Área Profesional:
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                categoryFilter === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todas las áreas ({categoryCounts.all})
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('administrative')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                categoryFilter === 'administrative'
                  ? 'bg-amber-700 text-white border-amber-700 shadow-2xs'
                  : 'bg-white text-amber-900 border-amber-200 hover:bg-amber-50/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Administrativo / Dirección / Gestión ({categoryCounts.admin})</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('it_tech')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                categoryFilter === 'it_tech'
                  ? 'bg-sky-700 text-white border-sky-700 shadow-2xs'
                  : 'bg-white text-sky-900 border-sky-200 hover:bg-sky-50/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>IT / Software / Desarrollo ({categoryCounts.it})</span>
            </button>

            <button
              type="button"
              onClick={() => setCategoryFilter('profile_recommendation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                categoryFilter === 'profile_recommendation'
                  ? 'bg-indigo-700 text-white border-indigo-700 shadow-2xs'
                  : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-50/50'
              }`}
            >
              Recomendadas para {activeProfile.name.split(' ')[0]} ({activeProfile.category === 'administrative' ? 'Admin' : 'IT'})
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs">
            {/* Grid for Zone, Distance, Salary, Sorting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Zone Filter */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Zona en Barcelona:
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    if (e.target.value !== 'custom') setCustomZoneText('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 text-xs focus:outline-sky-600"
                >
                  <option value="all">Todas las zonas de Barcelona</option>
                  <option value="les_corts">Les Corts (08029)</option>
                  <option value="diagonal">Diagonal / Maria Cristina</option>
                  <option value="sants">Sants / Pl. Espanya</option>
                  <option value="eixample">Eixample / Maternitat</option>
                  <option value="poblenou">22@ Poblenou</option>
                  <option value="sarria">Sarrià / Pedralbes</option>
                  <option value="remoto">100% Remoto</option>
                  <option value="custom">✏️ Personalizar zona...</option>
                </select>

                {selectedZone === 'custom' && (
                  <input
                    type="text"
                    value={customZoneText}
                    onChange={(e) => setCustomZoneText(e.target.value)}
                    placeholder="Escribe calle, barrio o municipio..."
                    className="w-full border border-sky-300 rounded-lg px-2.5 py-1 bg-sky-50/30 text-xs text-slate-900 mt-1 focus:outline-sky-600"
                  />
                )}
              </div>

              {/* Distance Radius Filter */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Radio desde Les Corts:
                </label>
                <select
                  value={distancePreset}
                  onChange={(e) => {
                    setDistancePreset(e.target.value as any);
                    if (e.target.value !== 'custom') setCustomMaxKm('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 text-xs focus:outline-sky-600"
                >
                  <option value="all">Cualquier distancia</option>
                  <option value="walk">&lt; 1 km (A pie desde Marqués de Sentmenat)</option>
                  <option value="metro">&lt; 2 km (Metro directo)</option>
                  <option value="city">&lt; 5 km (Barcelona ciudad)</option>
                  <option value="remote">Solo 100% Remoto</option>
                  <option value="custom">📏 Personalizar radio en km...</option>
                </select>

                {distancePreset === 'custom' && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="50"
                      value={customMaxKm}
                      onChange={(e) => setCustomMaxKm(e.target.value)}
                      placeholder="Ej: 3.5"
                      className="w-20 border border-sky-300 rounded-lg px-2 py-1 bg-sky-50/30 text-xs text-slate-900 focus:outline-sky-600"
                    />
                    <span className="text-[11px] text-slate-500">km de distancia máxima</span>
                  </div>
                )}
              </div>

              {/* Salary Filter */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Salario Mínimo:
                </label>
                <select
                  value={salaryPreset}
                  onChange={(e) => {
                    setSalaryPreset(e.target.value as any);
                    if (e.target.value !== 'custom') setCustomMinSalary('');
                  }}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 text-xs focus:outline-sky-600"
                >
                  <option value="all">Cualquier retribución</option>
                  <option value="25k">&gt; 25.000 € brutos/año</option>
                  <option value="30k">&gt; 30.000 € brutos/año</option>
                  <option value="35k">&gt; 35.000 € brutos/año</option>
                  <option value="45k">&gt; 45.000 € brutos/año</option>
                  <option value="b2b_day">Tarifa diaria B2B Autónomo</option>
                  <option value="custom">💰 Personalizar cantidad mínima...</option>
                </select>

                {salaryPreset === 'custom' && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      step="1000"
                      value={customMinSalary}
                      onChange={(e) => setCustomMinSalary(e.target.value)}
                      placeholder="Ej: 28000"
                      className="w-28 border border-sky-300 rounded-lg px-2 py-1 bg-sky-50/30 text-xs text-slate-900 focus:outline-sky-600"
                    />
                    <span className="text-[11px] text-slate-500">€ brutos/año</span>
                  </div>
                )}
              </div>

              {/* Sorting Filter */}
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-slate-700 block">
                  Ordenar Ofertas por:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 text-xs focus:outline-sky-600 font-medium"
                >
                  <option value="distance">📍 Más cercanas a Les Corts (a pie)</option>
                  <option value="salary">💶 Mayor retribución salarial</option>
                  <option value="recent">⏱️ Más recientes primero</option>
                  <option value="company">🏢 Empresa (A-Z)</option>
                </select>
              </div>
            </div>

            {/* Multi-select Portals Chips */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700">
                  Portales de Empleo Incluidos:
                </label>
                <div className="flex items-center gap-2 text-[10.5px]">
                  <button
                    type="button"
                    onClick={() => setSelectedPortals(new Set(allPortalIds))}
                    className="text-sky-700 hover:underline font-semibold"
                  >
                    Seleccionar todos
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPortals(new Set(['infojobs']))}
                    className="text-slate-500 hover:underline"
                  >
                    Solo InfoJobs
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {portalsList.map((p) => {
                  const isSelected = selectedPortals.has(p.id as PortalSource);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePortal(p.id as PortalSource)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 text-emerald-400" /> : <X className="w-3 h-3 text-slate-400" />}
                      <span>{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Multi-select Modalities & Contract */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              {/* Modality Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Modalidad de Trabajo:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'presencial', label: 'Presencial (BCN)' },
                    { id: 'hibrido', label: 'Híbrido' },
                    { id: 'remoto', label: '100% Remoto' },
                  ].map((m) => {
                    const isSelected = selectedModalities.has(m.id as Modality);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleModality(m.id as Modality)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold'
                            : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-sky-600" />}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contract Type Chips */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Tipo de Contratación:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'indefinido', label: 'Indefinido en Plantilla' },
                    { id: 'autonomo_b2b', label: 'Facturación B2B Autónomo' },
                    { id: 'temporal', label: 'Temporal' },
                  ].map((ct) => {
                    const isSelected = selectedContracts.has(ct.id);
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => toggleContract(ct.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-50 text-amber-950 border-amber-300 font-bold'
                            : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-amber-600" />}
                        <span>{ct.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Badges Summary */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wider">
              Filtros activos:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                Texto: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-700">✕</button>
              </span>
            )}

            {categoryFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-sky-50 text-sky-800 border border-sky-200">
                Área: {categoryFilter === 'administrative' ? 'Administrativo' : categoryFilter === 'it_tech' ? 'IT' : 'Recomendadas'}
                <button onClick={() => setCategoryFilter('all')} className="text-sky-600 hover:text-sky-900">✕</button>
              </span>
            )}

            {(selectedZone !== 'all' || customZoneText) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                Zona: {customZoneText || selectedZone.replace('_', ' ')}
                <button onClick={() => { setSelectedZone('all'); setCustomZoneText(''); }} className="text-emerald-600 hover:text-emerald-900">✕</button>
              </span>
            )}

            {(distancePreset !== 'all' || customMaxKm) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-indigo-50 text-indigo-800 border border-indigo-200">
                Distancia: {customMaxKm ? `< ${customMaxKm} km` : distancePreset}
                <button onClick={() => { setDistancePreset('all'); setCustomMaxKm(''); }} className="text-indigo-600 hover:text-indigo-900">✕</button>
              </span>
            )}

            {(salaryPreset !== 'all' || customMinSalary) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-800 border border-amber-200">
                Salario mín: {customMinSalary ? `>${customMinSalary}€` : salaryPreset}
                <button onClick={() => { setSalaryPreset('all'); setCustomMinSalary(''); }} className="text-amber-600 hover:text-amber-900">✕</button>
              </span>
            )}

            {selectedPortals.size < allPortalIds.length && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-purple-50 text-purple-800 border border-purple-200">
                {selectedPortals.size} portales selecc.
                <button onClick={() => setSelectedPortals(new Set(allPortalIds))} className="text-purple-600 hover:text-purple-900">✕</button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[11px] text-red-600 hover:underline ml-1 font-semibold"
            >
              Borrar todos
            </button>
          </div>
        )}
      </div>

      {/* Offers Feed Section */}
      <div className="space-y-3">
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOffers.map((job) => {
              const isAdded =
                addedOfferIds.has(job.id) ||
                candidatureCompanyRoleMap.has(`${job.company.toLowerCase().trim()}|${job.title.toLowerCase().trim()}`);

              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Top Row: Portal badge & Distance indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                          {job.portal.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            job.targetCategory === 'administrative'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-sky-100 text-sky-900 border border-sky-200'
                          }`}
                        >
                          {job.targetCategory === 'administrative' ? 'Administrativo' : 'IT Tech'}
                        </span>
                      </div>

                      {/* Distance Badge */}
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <Navigation className="w-3 h-3 text-sky-700 shrink-0" />
                        <span>{job.distanceFromLesCorts}</span>
                      </span>
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-sky-700 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.company}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {job.zone}
                        </span>
                      </div>
                    </div>

                    {/* Salary & Modality Pill Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {job.salary}
                      </span>
                      <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium">
                        {job.modality}
                      </span>
                      <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-medium">
                        {job.contractType === 'autonomo_b2b' ? 'B2B Autónomo' : job.contractType}
                      </span>
                      <span className="text-[10.5px] text-slate-400 ml-auto">
                        {job.publishedAt}
                      </span>
                    </div>

                    {/* Description excerpt */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                      {job.description}
                    </p>

                    {/* Key skills tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {job.keySkills.map((sk) => (
                        <span
                          key={sk}
                          onClick={() => {
                            if (!searchQuery.includes(sk)) {
                              setSearchQuery(searchQuery ? `${searchQuery} ${sk}` : sk);
                            }
                          }}
                          className="text-[10px] bg-slate-100 text-slate-700 hover:bg-slate-200 px-1.5 py-0.5 rounded font-medium cursor-pointer transition-colors"
                          title="Haz clic para filtrar por esta habilidad"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3.5 mt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 hover:underline py-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ver en {job.portal.replace('_', ' ')}</span>
                    </a>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddAndNotify(job)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all active:scale-98 ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>En Seguimiento</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Añadir a Candidaturas</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state protection: Never leave a dead screen! */
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="font-bold text-slate-900 text-base">
                No hay ofertas que coincidan con estos filtros exactos
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Has seleccionado criterios muy restrictivos. Pulsa el botón inferior para restablecer los filtros y ver las <strong>{offers.length} ofertas disponibles</strong> en Barcelona y Les Corts.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Mostrar Todas las Ofertas ({offers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors"
              >
                Limpiar búsqueda de texto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Add Job Modal */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddOffer={(newJob: JobOffer) => {
          onAddNewCustomOffer(newJob);
          setIsAddModalOpen(false);
        }}
        defaultCategory={activeProfile.category === 'administrative' ? 'administrative' : 'it_tech'}
      />
    </div>
  );
};
