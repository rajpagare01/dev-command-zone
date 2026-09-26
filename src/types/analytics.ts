// Exact response shapes for the Spring Boot /api/analytics/* endpoints.
// The backend is the source of truth — these mirror its DTOs field for field.

export interface AnalyticsOverview {
  totalDsaProblems: number;
  solvedDsaProblems: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalJobApplications: number;
  activeJobApplications: number;
  totalLearningTopics: number;
  completedLearningTopics: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalProjectTasks: number;
  completedProjectTasks: number;
}

export interface DsaAnalytics {
  totalProblems: number;
  solvedProblems: number;
  pendingProblems: number;
  revisionProblems: number;
  masteredProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;
  solvedToday: number;
  solvedThisWeek: number;
  solvedThisMonth: number;
}

export interface TaskAnalytics {
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  tasksDueToday: number;
  overdueTasks: number;
  completedToday: number;
}

export interface JobAnalytics {
  totalApplications: number;
  saved: number;
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  interviewRounds: number;
  upcomingInterviews: number;
  completedInterviews: number;
}

export interface TechnologyBreakdown {
  technology: string;
  topicCount: number;
  completedCount: number;
  averageProgress: number;
}

export interface LearningAnalytics {
  totalTopics: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  onHold: number;
  averageProgress: number;
  totalHoursSpent: number;
  technologyBreakdown: TechnologyBreakdown[];
}

export interface ProjectAnalytics {
  totalProjects: number;
  planning: number;
  inProgress: number;
  completed: number;
  onHold: number;
  archived: number;
  totalProjectTasks: number;
  todoProjectTasks: number;
  inProgressProjectTasks: number;
  completedProjectTasks: number;
  projectTaskCompletionRate: number;
}
