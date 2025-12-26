
export interface Interest {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export interface BookSummary {
  id: string;
  title: string;
  author: string;
  keyInsights: string[];
  mainTakeaway: string;
  readingTime: number;
  category?: string;
}

export interface DailyChallenge {
  title: string;
  action: string;
  benefit: string;
}

export interface HistoricalFigure {
  name: string;
  title: string;
  period: string;
  legacy: string;
  corePrinciples: string[];
  famousQuote: string;
}

export interface CourseModule {
  title: string;
  content: string;
  duration: string;
}

export interface Course {
  id: string;
  title: string;
  objective: string;
  modules: CourseModule[];
  totalDuration: string;
}

export interface GrowthPlan {
  dailyFocus: string;
  steps: {
    title: string;
    description: string;
    duration: string;
  }[];
  suggestedBooks: string[];
  challenge?: DailyChallenge;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  LOADING = 'LOADING',
  MAIN = 'MAIN'
}

export type ViewType = 'HOME' | 'EXPLORE' | 'SAVED' | 'PROFILE' | 'SUMMARY' | 'HISTORY' | 'COURSES' | 'COURSE_DETAIL' | 'HISTORY_DETAIL';
