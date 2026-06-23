export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  ai_provider: 'openai' | 'deepseek' | 'mimo';
  ai_api_key_encrypted: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  original_content: ResumeContent;
  raw_text: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeContent {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages?: string[];
  certifications?: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
}

export interface ResumeSection {
  id: string;
  resume_id: string;
  section_type: 'experience' | 'education' | 'skills' | 'summary';
  title: string | null;
  content: unknown;
  order_index: number;
  created_at: string;
}

export interface JobPosting {
  id: string;
  user_id: string;
  company_name: string | null;
  job_title: string | null;
  description: string;
  source_url: string | null;
  source_image_url: string | null;
  input_method: 'text' | 'url' | 'image';
  raw_data: unknown;
  created_at: string;
}

export type ApplicationStatus = 'to_apply' | 'applied' | 'interviewing' | 'offered' | 'rejected';

export interface Application {
  id: string;
  user_id: string;
  job_posting_id: string | null;
  analysis_id: string | null;
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  applied_at: string | null;
  notes: string | null;
  tailored_resume_url: string | null;
  cover_letter_url: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CompatibilityAnalysis {
  id: string;
  job_posting_id: string;
  resume_id: string;
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  recommendations: string[];
  ats_keywords: ATSKeyword[];
  created_at: string;
}

export interface ATSKeyword {
  keyword: string;
  type: 'hard' | 'soft';
  importance: 'critical' | 'high' | 'medium';
}

export interface CompanyInvestigation {
  id: string;
  company_name: string;
  website: string | null;
  phone: string | null;
  email: string | null;
  physical_address: string | null;
  linkedin_url: string | null;
  google_maps_url: string | null;
  reviews_summary: unknown;
  is_suspicious: boolean;
  fraud_alerts: string[];
  verification_status: 'verified' | 'suspicious' | 'ghost' | 'unverified';
  raw_osint_data: unknown;
  created_at: string;
}

export interface CoverLetter {
  id: string;
  application_id: string;
  content: string;
  tone: string;
  created_at: string;
}

export interface InterviewQuestion {
  question: string;
  category: string;
  starGuideline: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
}

export interface InterviewPrep {
  id: string;
  application_id: string;
  questions: InterviewQuestion[];
  created_at: string;
}

export interface AIProvider {
  id: 'openai' | 'deepseek' | 'mimo';
  name: string;
  models: {
    main: string;
    vision: string;
  };
}

export interface MatchScoreResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  recommendations: string[];
  atsKeywords: ATSKeyword[];
}

export interface OptimizedResume {
  summary: string;
  experience: Experience[];
  skills: string[];
  keywordsAdded: string[];
}
