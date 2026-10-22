export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type EisenhowerQuadrant = 'DO_FIRST' | 'SCHEDULE' | 'DELEGATE' | 'DELETE';

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: string;       // ISO Date
  dueDate?: string;        // ISO Date
  isCompleted: boolean;
  
  // Fields managed by user or AI
  priority: PriorityLevel;
  quadrant?: EisenhowerQuadrant;
  estimatedMinutes?: number;
  tags: string[];
  subtasks: Subtask[];
  
  // AI metadata from Gemini
  aiScore?: number;        // Task score from 1 to 100 for sorting
  aiReasoning?: string;    // Brief explanation why this priority was chosen
}

export interface AIPrioritizationResult {
  id: string;
  priority: PriorityLevel;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes: number;
  aiScore: number;
  aiReasoning: string;
}

export interface AIDecomposeResult {
  subtasks: Array<{
    title: string;
  }>;
}

export interface AIQuickAddResult {
  title: string;
  description?: string;
  dueDate?: string;
  priority: PriorityLevel;
  quadrant: EisenhowerQuadrant;
  estimatedMinutes?: number;
  tags: string[];
  aiScore?: number;
  aiReasoning?: string;
}

export type ViewMode = 'list' | 'matrix';

export type SortMode = 'aiScore' | 'dueDate' | 'priority' | 'createdAt';
