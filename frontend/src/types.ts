export type SupportedLanguage = 'auto' | 'en' | 'hi'

export interface AnalysisResultData {
  prediction?: 'Fake' | 'Real' | null
  confidence?: number | null
  detectedLanguage?: 'English' | 'Hindi' | null
  explanation?: string | null
  factualTruthVerified?: false
}

export interface HistoryEntryData {
  id: string
  title: string
  analyzedAt: Date
  label: 'Fake' | 'Real'
  language: 'English' | 'Hindi'
  confidence: number | null
}
