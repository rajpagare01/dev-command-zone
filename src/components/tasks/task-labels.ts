export const taskLabel = (v: string) =>
  v === "DSA" ? v : v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");
