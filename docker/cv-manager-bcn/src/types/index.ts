export type Modality = 'presencial' | 'hibrido' | 'remoto';

export type ApplicationStatus = 
  | 'enviada'
  | 'en_revision'
  | 'entrevista_rrhh'
  | 'prueba_tecnica'
  | 'entrevista_final'
  | 'oferta'
  | 'descartada'
  | 'en_espera';

export type PortalSource = 
  | 'infojobs'
  | 'linkedin'
  | 'indeed'
  | 'barcelona_activa'
  | 'feina_activa_soc'
  | 'tecnoempleo'
  | 'directo_empresa'
  | 'contacto_personal';

export interface InterviewRecord {
  id: string;
  round: string;
  date: string;
  time?: string;
  interviewers: string;
  format: 'videollamada' | 'presencial' | 'telefonica';
  platform?: string; // Teams, Google Meet, Zoom, etc.
  notes: string;
  feedback?: string;
  completed: boolean;
}

export interface ContactPerson {
  name: string;
  role: string;
  email: string;
  phone: string;
  linkedin?: string;
}

export interface Candidatura {
  id: string;
  profileId?: string;
  company: string;
  role: string;
  location: string;
  modality: Modality;
  portalSource: PortalSource;
  applicationDate: string;
  status: ApplicationStatus;
  contactPerson: ContactPerson;
  salaryDiscussed?: string;
  salaryRange?: string;
  contractModality: 'indefinido' | 'autonomo_b2b' | 'indiferente';
  jobUrl?: string;
  followUpDate?: string;
  generalNotes?: string;
  interviews: InterviewRecord[];
  tags: string[];
}

export interface ProjectExperience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
  roleTitle?: string;
  highlights?: string[];
}

export interface EducationItem {
  id: string;
  year: string;
  title: string;
  institution: string;
}

export interface CompetencyCategory {
  title: string;
  skills: string;
  achievements: string;
}

export interface CVProfile {
  personal: {
    fullName: string;
    headline: string;
    yearsExperience: string;
    street: string;
    district: string;
    postalCode: string;
    city: string;
    country: string;
    phonePrimary: string;
    phoneSecondary: string;
    email: string;
    linkedin: string;
    dni: string;
    availability: string;
    billingPreference: string;
    photoUrl: string;
    showPhoto: boolean;
  };
  summary: string;
  qualities: string[];
  coreCompetencies: CompetencyCategory[];
  experiences: ProjectExperience[];
  education: EducationItem[];
  technologies: {
    commercialSoftware: string[];
    openSource: string[];
    methodologies: string[];
    collaborativeTools: string[];
  };
  languages: Array<{ language: string; level: string }>;
  otherInfo: string[];
}

export type CVTemplate = 'modern_tech' | 'executive' | 'compact_ats' | 'catalan_minimal';
export type CVColor = 'azure' | 'slate' | 'emerald' | 'amber' | 'crimson';
export type CVFont = 'sans' | 'serif' | 'mono_hybrid';

export interface CVDesignSettings {
  template: CVTemplate;
  colorScheme: CVColor;
  fontPairing: CVFont;
  fontSize: 'compact' | 'regular' | 'large';
  showPhoto: boolean;
  language: 'es' | 'ca' | 'en';
  visibleSections: {
    photo: boolean;
    summary: boolean;
    competencies: boolean;
    experience: boolean;
    education: boolean;
    technologies: boolean;
    languages: boolean;
    qualities: boolean;
    otherInfo: boolean;
  };
}

export interface JobOffer {
  id: string;
  title: string;
  company: string;
  location: string;
  zone: string; // e.g. "Les Corts", "Diagonal / Maria Cristina", "22@ Poblenou", "Sants"
  portal: PortalSource;
  salary: string;
  modality: Modality;
  contractType: 'indefinido' | 'autonomo_b2b' | 'temporal';
  publishedAt: string;
  description: string;
  keySkills: string[];
  url: string;
  distanceFromLesCorts: string; // e.g. "A 800m (Metro Les Corts)", "Remoto 100%"
  featured?: boolean;
  targetCategory?: 'it_tech' | 'administrative' | 'all';
}

export type ProfileCategory = 'it_tech' | 'administrative' | 'management' | 'other';

export interface UserProfileAccount {
  id: string;
  name: string;
  headline: string;
  category: ProfileCategory;
  avatarUrl: string;
  cv: CVProfile;
  designSettings: CVDesignSettings;
}
