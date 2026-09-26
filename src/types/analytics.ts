// Response shapes for the Spring Boot /api/analytics/* endpoints.
// Fields are optional so the UI shows "—" rather than a fake 0 if the backend omits one.
export interface AnalyticsOverview {
  totalDsaProblems?: number; solvedDsaProblems?: number;
  totalTasks?: number; completedTasks?: number; pendingTasks?: number;
  totalJobApplications?: number; activeJobApplications?: number;
  totalLearningTopics?: number; completedLearningTopics?: number;
  totalProjects?: number; activeProjects?: number; completedProjects?: number;
  totalProjectTasks?: number; completedProjectTasks?: number;
}
export interface DsaAnalytics {
  totalProblems?: number; solvedProblems?: number; pendingProblems?: number; revisionProblems?: number; masteredProblems?: number;
  easyProblems?: number; mediumProblems?: number; hardProblems?: number;
  solvedToday?: number; solvedThisWeek?: number; solvedThisMonth?: number;
}
export interface TaskAnalytics {
  totalTasks?: number; todoTasks?: number; inProgressTasks?: number; completedTasks?: number;
  tasksDueToday?: number; overdueTasks?: number; completedToday?: number;
}
export interface JobAnalytics {
  totalApplications?: number; applied?: number; screening?: number; interview?: number; offer?: number; rejected?: number;
}
export interface LearningAnalytics {
  totalTopics?: number; notStarted?: number; inProgress?: number; completed?: number; onHold?: number;
  averageProgress?: number; totalHoursSpent?: number;
}
export interface ProjectAnalytics {
  totalProjects?: number; planning?: number; inProgress?: number; completed?: number; onHold?: number; archived?: number;
  totalProjectTasks?: number; todoProjectTasks?: number; inProgressProjectTasks?: number; completedProjectTasks?: number;
  projectTaskCompletionRate?: number;
}
