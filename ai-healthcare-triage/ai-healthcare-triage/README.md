# AI Healthcare Triage

A complete React + Vite + TypeScript prototype for healthcare navigation and pre-consultation support.

## Features

- Patient registration and demo login
- Multi-step symptom assessment
- Transparent prototype triage rules
- Triage result and care pathway
- Appointment booking with localStorage persistence
- Doctor dashboard and priority queue
- Patient details and consultation briefing
- Admin dashboard, patient, doctor and appointment views
- Responsive mobile/tablet/desktop layout
- Recharts dashboard visualization
- AI service placeholder for secure future backend integration

## Tech stack

React, Vite, TypeScript, Tailwind CSS, React Router, Lucide React, Recharts.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Demo accounts

- Patient: `patient@example.com` / `password123`
- Doctor: `doctor@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## Important safety note

This is a prototype for healthcare navigation and pre-consultation support. It is not a medical diagnosis tool, does not prescribe medication, and does not replace professional medical advice. Emergency warning signs in the demo flow display an instruction to seek immediate professional/emergency care.

The queue and triage rules are illustrative and are not clinically validated.

## Future backend

Connect authentication, appointments, patient records, audit logs and AI through a secure backend. Never expose AI provider API keys in the browser. The placeholder functions live in `src/utils/ai.ts`.

## Project structure

- `src/components` — reusable UI and feature components
- `src/pages` — route-level screens
- `src/data` — demo data
- `src/hooks` — reusable state logic
- `src/context` — authentication context
- `src/utils` — triage, queue and AI placeholder logic
- `src/types` — shared TypeScript types
