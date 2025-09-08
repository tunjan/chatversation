

export enum Role {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
  COACH = 'coach',
}

export interface Message {
  role: Role;
  content: string;
}

export enum Persona {
  NON_VEGAN = 'non-vegan',
}

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export interface FeedbackSection {
    score: number;
    comment: string;
}

export interface Feedback {
  flowchartAdherence: FeedbackSection;
  focusOnExploitation: FeedbackSection;
  victimPerspective: FeedbackSection;
  callToAction: FeedbackSection;
  overallScore: number;
  finalVerdict: string;
}

export interface HistoryEntry {
  id: string;
  transcript: Message[];
  feedback: Feedback;
  date: Date;
}