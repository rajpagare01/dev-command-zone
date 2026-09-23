import { BriefcaseBusiness, CheckCircle2, Code2, GraduationCap } from "lucide-react";
import type { DsaActivity, FocusTask, JobStage, LearningSkill, ProjectItem, StatItem } from "@/types/devcommand";

// Presentation-only data. Replace this module's consumers with API queries when the Spring Boot service is connected.
export const stats: StatItem[] = [
  { label: "DSA Problems", value: "127", change: "+8 this week", icon: Code2, tone: "blue" },
  { label: "Applications", value: "23", change: "+4 this week", icon: BriefcaseBusiness, tone: "violet" },
  { label: "Learning Hours", value: "42h", change: "+8h this week", icon: GraduationCap, tone: "amber" },
  { label: "Tasks Completed", value: "84%", change: "+12% this week", icon: CheckCircle2, tone: "green" },
];
export const focusTasks: FocusTask[] = [
  { id: 1, title: "Solve 3 DSA problems", priority: "High", completed: true },
  { id: 2, title: "Revise Spring Security", priority: "High", completed: false },
  { id: 3, title: "Work on DevCommand", priority: "Medium", completed: false },
  { id: 4, title: "Apply to 2 Java roles", priority: "Low", completed: false },
];
export const dsaActivity: DsaActivity[] = [
  { problem: "Two Sum", difficulty: "Easy", status: "Solved" },
  { problem: "Valid Parentheses", difficulty: "Easy", status: "Solved" },
  { problem: "LRU Cache", difficulty: "Medium", status: "Revision" },
  { problem: "Binary Tree Inorder", difficulty: "Easy", status: "Solved" },
];
export const weeklyActivity = [38, 58, 44, 82, 68, 92, 54];
export const learning: LearningSkill[] = [
  { name: "Java", value: 90 }, { name: "Spring Boot", value: 72 }, { name: "Docker", value: 54 },
  { name: "System Design", value: 38 }, { name: "PostgreSQL", value: 65 },
];
export const jobStages: JobStage[] = [
  { label: "Applied", value: 23, tone: "bg-info" }, { label: "Screening", value: 6, tone: "bg-warning" },
  { label: "Interview", value: 4, tone: "bg-primary" }, { label: "Offer", value: 1, tone: "bg-success" },
  { label: "Rejected", value: 9, tone: "bg-danger" },
];
export const projects: ProjectItem[] = [
  { name: "JobShield", stack: ["Spring Boot", "PostgreSQL", "Docker"], progress: 82 },
  { name: "DevCommand", stack: ["React", "TypeScript", "Spring Boot"], progress: 58 },
  { name: "SafeRoute", stack: ["Spring Boot", "Python", "PostgreSQL"], progress: 71 },
];
