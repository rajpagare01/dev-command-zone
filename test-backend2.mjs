import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

async function runTests() {
  const email = `testuser_${Date.now()}@example.com`;

  // 1. Auth
  console.log("--- Auth E2E ---");
  await api.post("/api/auth/register", { name: "Test User", email, password: "Password123!" });
  const loginRes = await api.post("/api/auth/login", { email, password: "Password123!" });
  const token = loginRes.data.token;
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  console.log("Auth: PASS");

  // 2. Tasks
  console.log("--- Tasks E2E ---");
  const taskRes = await api.post("/api/tasks", {
    title: "Test Task",
    description: null,
    priority: "HIGH",
    category: "PERSONAL",
    status: "TODO",
    dueDate: null,
  });
  console.log("Create Task: PASS", taskRes.data.id);
  const tasksRes = await api.get("/api/tasks");
  console.log("List Tasks: PASS, count=", tasksRes.data.content.length);

  // 3. DSA
  console.log("--- DSA E2E ---");
  const dsaRes = await api.post("/api/dsa", {
    title: "Two Sum",
    platform: "LEETCODE",
    problemUrl: null,
    topic: "ARRAYS",
    difficulty: "EASY",
    status: "TODO",
    dateSolved: null,
    timeTaken: null,
    notes: null,
    revisionDate: null,
  });
  console.log("Create DSA: PASS", dsaRes.data.id);
  const dsasList = await api.get("/api/dsa");
  console.log("List DSA: PASS, count=", dsasList.data.content.length);
  await api.patch(`/api/dsa/${dsaRes.data.id}/solve`);
  console.log("Solve DSA: PASS");

  // 4. Jobs
  console.log("--- Jobs E2E ---");
  const jobRes = await api.post("/api/jobs", {
    company: "Google",
    role: "SWE",
    location: null,
    jobUrl: null,
    source: null,
    salary: null,
    applicationDate: new Date().toISOString().split("T")[0],
    status: "APPLIED",
    notes: null,
  });
  console.log("Create Job: PASS", jobRes.data.id);

  // 5. Projects
  console.log("--- Projects E2E ---");
  const projRes = await api.post("/api/projects", {
    name: "Project A",
    description: "desc",
    githubUrl: "https://github.com",
    liveUrl: null,
    status: "PLANNING",
    startDate: null,
    endDate: null,
  });
  console.log("Create Project: PASS", projRes.data.id);

  // 5.5 Learning
  console.log("--- Learning E2E ---");
  const learnRes = await api.post("/api/learning", {
    technology: "React",
    topic: "Hooks",
    progress: 50,
    status: "IN_PROGRESS",
    hoursSpent: null,
    resourceUrl: null,
    notes: null,
  });
  console.log("Create Learning: PASS", learnRes.data.id);

  // 6. Analytics
  console.log("--- Analytics E2E ---");
  await api.get("/api/analytics/overview");
  console.log("Analytics Overview: PASS");
  await api.get("/api/analytics/dsa");
  console.log("Analytics DSA: PASS");
  await api.get("/api/analytics/tasks");
  console.log("Analytics Tasks: PASS");
  await api.get("/api/analytics/jobs");
  console.log("Analytics Jobs: PASS");
  await api.get("/api/analytics/projects");
  console.log("Analytics Projects: PASS");
  await api.get("/api/analytics/learning");
  console.log("Analytics Learning: PASS");

  console.log("ALL TESTS PASS");
}

runTests().catch((err) => {
  console.error("TEST FAILED");
  if (err.response) {
    console.error(err.response.status, err.response.data);
  } else {
    console.error(err.message);
  }
});
