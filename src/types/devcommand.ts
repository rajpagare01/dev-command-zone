import type { LucideIcon } from "lucide-react";

export type NavPath =
  | "/dashboard"
  | "/dsa"
  | "/jobs"
  | "/learning"
  | "/projects"
  | "/tasks"
  | "/analytics"
  | "/settings";
export interface NavigationItem {
  label: string;
  path: NavPath;
  icon: LucideIcon;
}
export interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "violet";
}
export interface FocusTask {
  id: number;
  title: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}
export interface DsaActivity {
  problem: string;
  difficulty: "Easy" | "Medium";
  status: "Solved" | "Revision";
}
export interface LearningSkill {
  name: string;
  value: number;
}
export interface JobStage {
  label: string;
  value: number;
  tone: string;
}
export interface ProjectItem {
  name: string;
  stack: string[];
  progress: number;
}
