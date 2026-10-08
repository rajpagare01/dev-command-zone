/** Stable presentation anchors, independent of request state and route URLs. */
export const dashboardSections = [
  { id: "dashboard-priority", label: "Priority focus", keywords: ["high priority", "start task"] },
  { id: "dashboard-tasks", label: "Today’s focus", keywords: ["tasks", "due today", "overdue"] },
  { id: "dashboard-dsa", label: "Problem-solving focus", keywords: ["dsa", "revision", "problems"] },
  { id: "dashboard-metrics", label: "Key metrics", keywords: ["overview", "summary", "analytics"] },
  { id: "dashboard-jobs", label: "Job Applications", keywords: ["jobs", "interviews", "pipeline"] },
  { id: "dashboard-learning", label: "Learning Progress", keywords: ["topics", "hours", "learning"] },
  { id: "dashboard-projects", label: "Projects", keywords: ["project tasks", "building"] },
  { id: "dashboard-actions", label: "Quick actions", keywords: ["add", "create", "workspaces"] },
] as const;