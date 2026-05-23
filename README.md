# ResumeAI — AI-Powered ATS Resume Builder

A production-ready, full-stack SaaS application that automatically creates highly ATS-optimized resumes using Claude AI, tailored to any job description.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Auth | Clerk |
| Database | PostgreSQL + Prisma ORM |
| PDF Export | Puppeteer |
| Resume Parsing | pdf-parse (PDF), Mammoth (DOCX) |

---

## Project Structure

```
ats-resume-builder/
├── app/
│   ├── (auth)/               # Clerk sign-in/sign-up pages
│   ├── (dashboard)/          # Protected app pages
│   │   ├── dashboard/        # Resume list dashboard
│   │   ├── builder/          # Main 3-panel builder UI ← Core
│   │   └── history/          # Optimization history
│   ├── api/
│   │   ├── resume/
│   │   │   ├── optimize/     # AI optimization endpoint ← Core
│   │   │   ├── parse/        # File/text parsing
│   │   │   ├── export/       # PDF generation
│   │   │   ├── list/         # CRUD operations
│   │   │   ├── cover-letter/ # AI cover letter
│   │   │   └── interview-questions/ # AI interview prep
│   │   ├── jd/analyze/       # JD intelligence extraction
│   │   └── ats/score/        # ATS scoring
│   ├── layout.tsx
│   └── page.tsx              # Landing page
├── components/
│   ├── resume/
│   │   ├── ResumeTemplate.tsx  # Exact reference resume format ← Core
│   │   └── ResumePreview.tsx   # Live preview with download
│   ├── ats/ATSScorePanel.tsx   # Score visualization
│   ├── upload/ResumeUpload.tsx # Drag & drop + paste input
│   ├── jd/JDInputPanel.tsx     # JD input + analysis display
│   └── layout/Navbar.tsx
├── lib/
│   ├── ai/
│   │   ├── claude.ts           # Claude API client
│   │   ├── prompts.ts          # Carefully engineered prompts ← Core
│   │   └── parsers.ts          # Resume text parser
│   ├── ats/scorer.ts           # ATS scoring algorithm
│   ├── pdf/generator.ts        # HTML→PDF via Puppeteer
│   └── db/prisma.ts
├── hooks/
│   ├── useResume.ts
│   └── useATSScore.ts
├── types/index.ts              # Full TypeScript types
├── prisma/schema.prisma
├── docker-compose.yml
└── middleware.ts               # Clerk route protection
```

---

## Quick Start

### 1. Clone and install

```bash
cd ats-resume-builder
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
# Get from console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-api03-...

# Get from clerk.com (free)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/ats_resume_builder"
```

### 3. Start PostgreSQL

```bash
docker-compose up postgres -d
```

### 4. Setup database

```bash
npm run db:generate
npm run db:push
```

### 5. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Docker (Full Stack)

```bash
docker-compose up --build
```

---

## Core Features

### Builder UI (3-Panel Layout)
- **Left**: Resume upload (PDF/DOCX/TXT drag & drop, or paste text) + JD input
- **Center**: Live resume preview in exact reference format
- **Right**: ATS score panel with keyword match, missing keywords, suggestions

### AI Optimization Pipeline
1. JD Analysis → extracts 15+ priority keywords, required skills, tools, domain terms
2. Resume Optimization → rewrites summary, reorders skills, rewrites experience bullets
3. ATS Scoring → 100-point algorithm across 5 dimensions

### ATS Score Breakdown
| Dimension | Max Points |
|-----------|------------|
| Keyword Match | 40 |
| Skills Match | 20 |
| Format Score | 20 |
| Readability | 10 |
| Completeness | 10 |

### Bonus Tools (after optimization)
- **AI Cover Letter** — 3-paragraph tailored cover letter
- **Interview Questions** — 10 role-specific questions with tips

---

## Resume Format

The `ResumeTemplate` component exactly replicates the reference resume format:
- Name: Large, centered, uppercase
- Contact: Centered with pipe separators
- Sections: Bold uppercase headers with bottom border
- Experience: Role + Company left, Date right (flex layout)
- Bullets: Disc list, action-verb-first
- Skills: Bold category name + comma-separated items
- ATS-safe: Single column, no tables, no graphics

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/resume/parse` | POST | Parse PDF/DOCX/text into structured ResumeData |
| `/api/resume/optimize` | POST | AI optimize resume for JD |
| `/api/resume/export` | POST | Generate PDF download |
| `/api/resume/list` | GET/DELETE | List/delete saved resumes |
| `/api/resume/cover-letter` | POST | Generate tailored cover letter |
| `/api/resume/interview-questions` | POST | Generate interview prep questions |
| `/api/jd/analyze` | POST | Extract JD intelligence |
| `/api/ats/score` | POST | Calculate ATS score |

---

## Environment Variables Reference

| Variable | Required | Source |
|----------|----------|--------|
| `ANTHROPIC_API_KEY` | Yes | console.anthropic.com |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | clerk.com dashboard |
| `CLERK_SECRET_KEY` | Yes | clerk.com dashboard |
| `DATABASE_URL` | Yes | PostgreSQL connection string |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables
4. Add PostgreSQL (Vercel Postgres or Neon)
5. Set `serverComponentsExternalPackages` in next.config.ts (already done)

**Note**: Puppeteer requires `@sparticuz/chromium` for serverless deployment. For Vercel:

```bash
npm install @sparticuz/chromium puppeteer-core
```

Then update `lib/pdf/generator.ts` to use `puppeteer-core` with `@sparticuz/chromium`.

---

## ATS Systems Supported

The output format is optimized for parsing by:
- Workday
- Greenhouse
- Lever
- Taleo
- iCIMS
- SmartRecruiters
- BambooHR
- Any ATS that reads PDF/text

---

## Customization

### Adding Resume Templates
Duplicate `components/resume/ResumeTemplate.tsx` with different styling and add a template selector in the builder.

### Changing AI Model
In `lib/ai/claude.ts`, change `MODEL` constant:
```ts
const MODEL = "claude-opus-4-7"; // For highest quality
```

### Adjusting ATS Scoring Weights
Edit `lib/ats/scorer.ts` — modify the max points per category in `calculateATSScore`.
