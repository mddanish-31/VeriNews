export type SupportedLanguage = 'auto' | 'en' | 'hi'
export type InputType = 'headline' | 'article' | 'url'

export interface TokenAttributionData {
  token: string
  weight?: number | null
  direction?: string | null
}

export interface EvidenceSourceData {
  title: string
  publisher: string
  url: string
  snippet?: string
  date?: string | null
}

export type VerificationStatus =
  | 'Supported by Available Evidence'
  | 'Contradicted by Available Evidence'
  | 'Partially Supported'
  | 'Misleading or Missing Context'
  | 'Insufficient Evidence'
  | 'Unable to Verify'

export interface AnalysisResultData {
  // Evidence-assisted verification fields
  status?: VerificationStatus | string | null
  summary?: string | null
  claimChecked?: string | null
  explanation?: string | null
  supportingEvidence?: string[]
  contradictoryEvidence?: string[]
  missingContext?: string[]
  sources?: EvidenceSourceData[]
  limitations?: string[]
  inputType?: InputType | string
  extractedHeadline?: string | null

  // Legacy compatibility fields
  prediction?: 'Credible' | 'Unreliable' | 'Real' | 'Fake' | 'Unclassifiable' | string | null
  confidence?: number | null
  confidenceTier?: string | null
  detectedLanguage?: 'English' | 'Hindi' | string | null
  influentialTokens?: TokenAttributionData[]
  disclaimer?: string | null
  modelVersion?: string | null
  latencyMs?: number | null
  factualTruthVerified?: false
}

export interface HistoryEntryData {
  id: string
  title: string
  analyzedAt: Date
  label: 'Credible' | 'Unreliable' | 'Fake' | 'Real' | 'Unclassifiable' | string
  language: 'English' | 'Hindi'
  confidence: number | null
}
