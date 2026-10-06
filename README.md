# DevCommand Hub

Build a production-quality frontend web application called DevCommand — Personal Developer Command Center.

This is a personal developer productivity platform that I will use to manage my software-development journey.

IMPORTANT

This request is ONLY for the frontend.

Do NOT build a backend.
Do NOT create a database.
Do NOT replace my existing Spring Boot backend.
Do NOT implement Supabase.
Do NOT use Firebase.
Do NOT create fake backend APIs.

The backend will be a separate Java 23 + Spring Boot + PostgreSQL REST API.

Build the frontend so it can later connect cleanly to that backend.

PRODUCT VISION

DevCommand is a personal command center for a developer.

The application will eventually manage:

DSA problems

Job applications

Interview rounds

Learning progress

Projects

Daily tasks

Analytics

Developer activity

WhatsApp commands

AI developer assistant

The current frontend should establish the complete visual foundation while only implementing the authentication UI and dashboard shell.

DESIGN STYLE

Create a premium developer workspace, NOT a generic admin dashboard.

Visual direction:

Modern

Minimal

Professional

Developer-focused

Dark-first

Clean

Spacious

Responsive

High-quality typography

Subtle borders

Subtle shadows

Smooth micro-interactions

Think of the experience as a combination of:

Linear

Vercel

GitHub

Raycast

modern developer dashboards

But do NOT copy any specific product's design.

Create an original visual identity for DevCommand.

BRAND

Application name:

DevCommand

Tagline:

Your personal developer command center.

Use a simple developer-oriented logo/icon.

The interface should feel like a tool built specifically for developers.

COLOR SYSTEM

Use a dark-first theme.

Primary background:
Very dark neutral

Secondary background:
Slightly lighter dark surface

Cards:
Dark elevated surfaces

Borders:
Subtle neutral borders

Primary accent:
Blue/indigo

Success:
Green

Warning:
Amber

Danger:
Red

Text:
White / near-white

Secondary text:
Muted gray

Do not scatter random colors throughout the UI.

Create a consistent design system.

APPLICATION LAYOUT

Create the main authenticated application layout:

┌─────────────────────────────────────────────────────────────┐
│ DevCommand Search 🔔 👤 Raj │
├───────────────┬─────────────────────────────────────────────┤
│ │ │
│ 🏠 Dashboard │ │
│ │ │
│ 🧩 DSA │ │
│ 💼 Jobs │ Main Content │
│ 📚 Learning │ │
│ 🚀 Projects │ │
│ ✅ Tasks │ │
│ 📊 Analytics │ │
│ │ │
│ ───────────── │ │
│ ⚙ Settings │ │
│ │ │
│ │ │
│ Raj Pagare │ │
└───────────────┴─────────────────────────────────────────────┘

Sidebar should support:

Active state

Hover state

Icons

Collapsing on desktop

Drawer on mobile

Topbar should include:

Search

Notifications

User avatar

User menu

ROUTES

Create these routes:

/login
/register

/dashboard

/dsa
/jobs
/learning
/projects
/tasks
/analytics
/settings

Only fully design these pages initially:

/login
/register
/dashboard

For the other pages, create polished placeholder screens showing:

Page title

Short description

Relevant icon

"Coming next" state

Do NOT implement their actual functionality yet.

LOGIN PAGE

Create a premium login experience.

Layout:

Left side:

DevCommand branding

Short tagline

Developer-oriented visual

Right side:

Login card

Fields:

Email

Password

Actions:

Login

Forgot password placeholder

Link to Register

Example:

Welcome back

Continue managing your developer journey.

Email
[________________]

Password
[________________]

[ Login ]

Don't have an account?
Create one

Add proper client-side validation.

Do not create fake authentication.

REGISTER PAGE

Fields:

Name

Email

Password

Confirm Password

Actions:

Create account

Link to Login

Add validation.

Password requirements should be visually communicated.

DASHBOARD

Create a visually impressive developer dashboard.

Header:

Good evening, Raj 👋

Here's your development activity at a glance.

Add a date indicator.

KPI CARDS

Create four primary cards:

DSA

🧩
DSA Problems
127
+8 this week

Jobs

💼
Applications
23
+4 this week

Learning

📚
Learning Hours
42h
+8h this week

Tasks

✅
Tasks Completed
84%
+12% this week

These are currently presentation-only values.

Clearly structure the frontend so these values can later come from the Spring Boot API.

TODAY'S FOCUS

Create a prominent section:

Today's Focus

☑ Solve 3 DSA problems
☐ Revise Spring Security
☐ Work on DevCommand
☐ Apply to 2 Java roles

Include:

Progress indicator

Priority badges

Add task button

For now the tasks can be local/mock presentation data.

Do NOT build backend task functionality.

DSA ACTIVITY

Create a section showing recent DSA activity.

Example:

Recent DSA Activity

Two Sum Easy Solved
Valid Parentheses Easy Solved
LRU Cache Medium Revision
Binary Tree Inorder Easy Solved

Add a small weekly activity visualization.

This can use static presentation data for now.

Do NOT implement actual analytics logic.

LEARNING PROGRESS

Create cards/progress bars for:

Java 90%
Spring Boot 72%
Docker 54%
System Design 38%
PostgreSQL 65%

Again, these are temporary presentation values.

JOB APPLICATION SNAPSHOT

Create a compact visualization:

Job Applications

Applied 23
Screening 6
Interview 4
Offer 1
Rejected 9

Use visually distinct status badges.

Do not implement the job tracker yet.

PROJECTS

Create a "Current Projects" section.

Example:

JobShield
Spring Boot · PostgreSQL · Docker
████████████░░ 82%

DevCommand
React · TypeScript · Spring Boot
███████░░░░░░░ 58%

SafeRoute
Spring Boot · Python · PostgreSQL
█████████░░░░ 71%

Use cards with technology badges.

QUICK ACTIONS

Create a quick-actions section:

- Add DSA Problem
- Add Job Application
- Add Learning Topic
- Add Task
- Add Project

These buttons can initially display a "Coming soon" state.

Do not implement the actual backend functionality.

DSA PAGE PLACEHOLDER

Create a polished placeholder route:

DSA Tracker

Track every problem you solve and build consistent problem-solving habits.

Coming next.

Include navigation and page structure that will later support:

Problem table

Filters

Difficulty

Status

Topics

Search

Pagination

Add problem

Do not implement the functionality yet.

JOBS PAGE PLACEHOLDER

Prepare the visual structure for:

Job table

Company

Role

Status

Application date

Interview rounds

Filters

But do not implement functionality.

LEARNING PAGE PLACEHOLDER

Prepare visual structure for:

Technologies

Topics

Progress

Hours

Resources

PROJECTS PAGE PLACEHOLDER

Prepare visual structure for:

Project cards

Technologies

GitHub

Live deployment

Progress

Tasks

TASKS PAGE PLACEHOLDER

Prepare visual structure for:

Today

Upcoming

Completed

Priority

Categories

ANALYTICS PAGE PLACEHOLDER

Prepare a polished analytics shell containing:

DSA analytics

Learning analytics

Job analytics

Task completion

Developer activity

Do NOT generate fake complex charts that pretend to represent real user data.

RESPONSIVE DESIGN

The application must work well on:

Desktop:

Full sidebar

Multi-column dashboard

Tablet:

Compact sidebar

Mobile:

Sidebar becomes drawer

Cards stack

Tables become mobile-friendly

Topbar adapts

No horizontal overflow

Test the design mentally and structurally for:

1440px

1024px

768px

390px

COMPONENT SYSTEM

Create reusable components for:

Button

Card

Badge

Input

Select

Modal

Dropdown

Avatar

Progress bar

Skeleton/loading state

Empty state

Toast

Page header

Stat card

Sidebar

Topbar

Do not create unnecessary abstractions.

FRONTEND ARCHITECTURE

Organize the code cleanly.

Suggested structure:

src/
├── components/
│ ├── ui/
│ ├── layout/
│ ├── dashboard/
│ └── common/
│
├── pages/
│ ├── auth/
│ ├── dashboard/
│ ├── dsa/
│ ├── jobs/
│ ├── learning/
│ ├── projects/
│ ├── tasks/
│ ├── analytics/
│ └── settings/
│
├── layouts/
├── services/
├── hooks/
├── context/
├── types/
├── utils/
└── routes/

Use TypeScript types instead of excessive any.

BACKEND INTEGRATION PREPARATION

The real backend will be:

Java 23
Spring Boot
PostgreSQL

Backend base URL will eventually be:

http://localhost:8080

Prepare an API service layer so the UI doesn't directly make fetch requests everywhere.

Use an environment variable such as:

VITE_API_URL

Do NOT connect to a fake backend.

Do NOT create Supabase.

Do NOT create Firebase.

Do NOT create mock API endpoints pretending to be real.

Static presentation data is acceptable only for the initial dashboard UI.

AUTHENTICATION PREPARATION

The Spring Boot backend will expose:

POST /api/auth/register
POST /api/auth/login

Prepare the frontend authentication architecture around these endpoints.

Eventually the login response will contain a JWT.

Prepare the application so authenticated API requests can use:

Authorization: Bearer <JWT>

Do not implement a fake login that simply redirects the user without authentication.

FUTURE WHATSAPP INTEGRATION

Do not implement WhatsApp now.

However, keep the frontend architecture flexible enough for future activity generated from WhatsApp.

Eventually a user may send:

solved leetcode 135

or:

add todo revise Spring Security

through WhatsApp and the backend will update DevCommand.

The frontend should eventually display those updates naturally.

Do not create fake WhatsApp functionality now.

UX DETAILS

Add subtle interactions:

Sidebar hover animations

Card hover elevation

Button feedback

Smooth page transitions

Skeleton loading

Toast notifications

Empty states

Keep animations subtle and professional.

Avoid:

excessive glassmorphism

excessive gradients

huge animations

distracting effects

unnecessary 3D elements

ACCESSIBILITY

Use:

semantic HTML

keyboard-accessible controls

proper labels

appropriate contrast

focus states

ARIA attributes where necessary

IMPORTANT CONSTRAINTS

Do NOT:

create a backend

create a database

use Supabase

use Firebase

implement DSA CRUD

implement job CRUD

implement learning CRUD

implement project CRUD

implement task CRUD

implement analytics logic

implement WhatsApp

implement AI

implement GitHub integration

implement LeetCode integration

The goal is to create a high-quality frontend foundation and dashboard experience, ready to connect to my Spring Boot backend later.

FINAL REQUIREMENTS

After building:

Make sure the application runs.

Make sure there are no TypeScript errors.

Make sure there are no console errors.

Make sure all routes work.

Make sure mobile layout works.

Make sure navigation works.

Make sure Login/Register UI is complete.

Make sure Dashboard UI is polished.

Keep mock presentation data clearly separated from future API data.

Do not modify or create any backend.

Build the application now.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a556803e-be99-4d47-83bf-c6623708e6c4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
