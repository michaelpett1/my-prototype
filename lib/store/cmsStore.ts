'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CMSContent, CMSContentStatus, CMSContentType } from '@/lib/types';

const now = new Date().toISOString();
const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const MOCK_CONTENT: CMSContent[] = [
  {
    id: 'cms-1',
    title: 'Introducing AI-Powered Roadmap Suggestions',
    slug: 'ai-powered-roadmap-suggestions',
    type: 'announcement',
    status: 'published',
    body: `We're excited to announce our latest feature: AI-powered roadmap suggestions that automatically surface the most relevant items from your JIRA, Confluence, and Slack workspaces.

## What's new

Our AI scans your connected tools on a configurable schedule and presents prioritised suggestions directly in your roadmap inbox. Each suggestion comes with a relevance score, source context, and duplicate detection — so you can confidently accept, defer, or dismiss with a single click.

## How it works

1. **Connect your tools** — link JIRA projects, Confluence spaces, and Slack channels in Settings.
2. **Run a scan** — trigger manually or let the scheduler handle it.
3. **Review suggestions** — items appear in the Suggestions tab, ranked by relevance.
4. **Promote to roadmap** — accepted suggestions become full timeline items.

We believe this will dramatically reduce the time PMs spend triaging backlogs. Give it a try and let us know what you think.`,
    excerpt: "Automatically surface roadmap-worthy items from across your team's tools with AI-powered relevance scoring.",
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    tags: ['product', 'ai', 'announcement'],
    seoTitle: 'AI-Powered Roadmap Suggestions | Northstar',
    seoDescription: "Discover how Northstar's AI automatically surfaces roadmap insights from JIRA, Confluence, and Slack.",
    publishedAt: d(12),
    scheduledAt: null,
    createdAt: d(18),
    updatedAt: d(12),
    readTime: 3,
  },
  {
    id: 'cms-2',
    title: 'v2.4 Release Notes — Enhanced Timeline Views',
    slug: 'v2-4-release-notes-timeline-views',
    type: 'release_note',
    status: 'published',
    body: `## v2.4.0 — Released April 10, 2025

### New features

- **Gantt drag-and-drop** — resize and reorder timeline items directly on the chart.
- **Board view** — Kanban-style board grouped by status for a sprint-friendly overview.
- **Dependency arrows** — visual indicators between dependent items on the Gantt chart.
- **Bulk status update** — select multiple items and update their status in one action.

### Improvements

- Timeline table now supports inline editing for title, dates, and priority.
- Improved performance when rendering charts with 200+ items.
- Sidebar collapse state is now persisted across sessions.

### Bug fixes

- Fixed an issue where drag handles were not visible in compact row mode.
- Resolved incorrect date display for items spanning quarter boundaries.
- Fixed sidebar tooltip cut-off on smaller screen sizes.`,
    excerpt: 'Drag-and-drop Gantt, board view, dependency arrows, and bulk status updates.',
    authorId: 'user-2',
    authorName: 'James Park',
    tags: ['release', 'changelog', 'timelines'],
    seoTitle: 'v2.4 Release Notes | Northstar',
    seoDescription: 'See what shipped in Northstar v2.4 — enhanced timeline views, drag-and-drop Gantt, and more.',
    publishedAt: d(13),
    scheduledAt: null,
    createdAt: d(16),
    updatedAt: d(13),
    readTime: 2,
  },
  {
    id: 'cms-3',
    title: 'How We Reduced Sprint Planning Time by 40%',
    slug: 'reduced-sprint-planning-time',
    type: 'blog_post',
    status: 'published',
    body: `Sprint planning used to eat up half a day every two weeks. Here's how the team at Beacon Labs cut that down to under two hours using Northstar's visual roadmap and AI suggestion workflow.

## The problem

Before Northstar, the team was using a mix of JIRA, Confluence pages, and ad-hoc Slack threads to prepare for sprint planning. By the time the meeting started, half the context lived in people's heads and the backlog was a mess.

## What changed

**1. Centralised intake**
All new ideas — whether from JIRA comments, Confluence retro notes, or Slack threads — now flow through Northstar's suggestions queue. The team reviews it asynchronously before planning.

**2. AI prioritisation**
Relevance scoring means the most impactful items bubble up automatically. Engineers stopped arguing about what to pick — the data made it obvious.

**3. Visual planning**
The sprint roadmap board gave everyone a shared visual of the upcoming quarter. Drag-and-drop let the PM adjust scope in real time during the meeting itself.

## Results

- Planning meeting: 4 hours → 1.5 hours
- Backlog grooming: eliminated as a separate ceremony
- Team NPS for planning: up 18 points

If you're still running planning the old way, it's worth trying a two-sprint experiment.`,
    excerpt: 'How Beacon Labs cut sprint planning from 4 hours to 90 minutes with AI-powered backlog triage.',
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    tags: ['case-study', 'planning', 'blog'],
    seoTitle: 'How We Reduced Sprint Planning Time by 40% | Northstar Blog',
    seoDescription: 'A case study on cutting sprint planning from 4 hours to 90 minutes using Northstar.',
    publishedAt: d(21),
    scheduledAt: null,
    createdAt: d(25),
    updatedAt: d(21),
    readTime: 5,
  },
  {
    id: 'cms-4',
    title: 'Product Development Handbook',
    slug: 'product-development-handbook',
    type: 'internal_doc',
    status: 'published',
    body: `This handbook outlines how the product team operates: from idea intake to delivery. It's a living document — update it when processes change.

## Intake and prioritisation

All new feature ideas must be logged as a roadmap suggestion before they can be promoted to the backlog. The PM reviews suggestions weekly and assigns a priority based on:

- Strategic alignment (OKR fit)
- Effort estimate (from engineering)
- Customer demand signal (support tickets, NPS comments)

## Roadmap management

The roadmap is the single source of truth. Status must be kept up to date — **do not** track progress in a separate spreadsheet.

Items move through: Not Started → In Progress → At Risk → Complete.

## OKR process

OKRs are set quarterly. Each objective must have 2–5 key results with measurable targets. Check-ins are weekly; confidence scores are mandatory.

## Shipping

- All launches require a release note in the CMS before deployment.
- External announcements are drafted at least 3 days before the ship date.
- Retrospectives are logged in Confluence within 48 hours of the sprint end.`,
    excerpt: 'How the product team operates: intake, prioritisation, roadmap management, OKRs, and shipping.',
    authorId: 'user-3',
    authorName: 'Maya Torres',
    tags: ['internal', 'process', 'handbook'],
    seoTitle: 'Product Development Handbook | Northstar Internal',
    seoDescription: 'Internal handbook covering product intake, roadmap, OKRs, and shipping processes.',
    publishedAt: d(45),
    scheduledAt: null,
    createdAt: d(60),
    updatedAt: d(7),
    readTime: 6,
  },
  {
    id: 'cms-5',
    title: 'Q2 2025 Roadmap Update',
    slug: 'q2-2025-roadmap-update',
    type: 'announcement',
    status: 'in_review',
    body: `As we move into Q2, here's a preview of what the product team is focused on over the next three months.

## Theme: Collaboration & Transparency

Q2 is all about making it easier for the whole organisation — not just PMs — to stay aligned on what's being built and why.

## Key initiatives

**Real-time commenting** — Add inline comments to roadmap items, timelines, and OKRs. Replaces the endless Slack threads about "what's the status of X".

**Stakeholder view** — A read-only, curated view of the roadmap for execs and stakeholders who don't need full product access.

**OKR embeds** — Embed live OKR progress widgets directly in Confluence pages and Slack channels.

**Mobile app (beta)** — A lightweight iOS and Android app for reviewing and approving suggestions on the go.

## What we're not doing this quarter

- A full API — pushed to Q3 due to auth complexity.
- Custom fields on timeline items — deprioritised in favour of commenting.

We'll share a more detailed spec for each initiative before development begins. Feedback welcome in #product-roadmap.`,
    excerpt: 'Q2 is focused on collaboration and transparency — commenting, stakeholder views, OKR embeds, and a mobile beta.',
    authorId: 'user-1',
    authorName: 'Sarah Chen',
    tags: ['roadmap', 'q2', 'announcement'],
    seoTitle: 'Q2 2025 Roadmap Update | Northstar',
    seoDescription: 'What the Northstar product team is building in Q2 2025.',
    publishedAt: null,
    scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: d(3),
    updatedAt: d(1),
    readTime: 4,
  },
  {
    id: 'cms-6',
    title: 'Onboarding Guide for New Product Managers',
    slug: 'onboarding-guide-new-pms',
    type: 'internal_doc',
    status: 'draft',
    body: `Welcome to the team! This guide will get you up and running with Northstar in your first week.

## Day 1

- Get access to the workspace (ask your manager to invite you via Settings → Team Members)
- Review the Product Development Handbook
- Attend the weekly roadmap sync (Tuesdays, 10am)

## Week 1

- Shadow the current PM on a suggestions review session
- Explore the existing roadmap and OKRs to understand current priorities
- Read the last 3 sprint retrospectives in Confluence

## Tools you'll use

- **Northstar** — roadmap, OKRs, suggestions
- **JIRA** — engineering backlog
- **Confluence** — specs and retros
- **Slack** — #product, #product-roadmap, #eng-updates

## Who to talk to

[TODO: add team directory]

## First 30 days goals

[TODO: fill in with manager]`,
    excerpt: 'A first-week guide for new PMs joining the Northstar workspace.',
    authorId: 'user-3',
    authorName: 'Maya Torres',
    tags: ['internal', 'onboarding'],
    seoTitle: 'PM Onboarding Guide | Northstar Internal',
    seoDescription: 'Get up and running with Northstar in your first week.',
    publishedAt: null,
    scheduledAt: null,
    createdAt: d(5),
    updatedAt: d(2),
    readTime: 3,
  },
  {
    id: 'cms-7',
    title: 'v2.5 Release Notes — OKR Check-ins & Confidence Scoring',
    slug: 'v2-5-release-notes-okr-checkins',
    type: 'release_note',
    status: 'draft',
    body: `## v2.5.0 — Coming soon

### New features

- **Weekly check-in reminders** — Slack notifications prompt OKR owners to update confidence and add a note each week.
- **Confidence trend chart** — visualise how confidence scores have moved over the quarter for each key result.
- **OKR health roll-up** — Dashboard now shows an aggregate health score across all active objectives.
- **KR weighting** — Assign custom weights to key results within an objective for a more accurate overall score.

### Improvements

- Check-in modal now shows the previous check-in value for reference.
- OKR period labels are clearer (e.g. "Q2 2025" instead of "quarterly").
- Improved empty states across OKR views.

### Bug fixes

- Fixed a rounding error in percentage-type key results.
- Resolved a layout issue in the OKR table when objective titles were long.`,
    excerpt: 'Check-in reminders, confidence trend charts, OKR health roll-up, and KR weighting.',
    authorId: 'user-2',
    authorName: 'James Park',
    tags: ['release', 'changelog', 'okrs'],
    seoTitle: 'v2.5 Release Notes | Northstar',
    seoDescription: 'See what is coming in Northstar v2.5 — OKR check-ins, confidence scoring, and more.',
    publishedAt: null,
    scheduledAt: null,
    createdAt: d(2),
    updatedAt: d(0),
    readTime: 2,
  },
];

// ── Store ─────────────────────────────────────────────────────────────────────

interface CMSState {
  items: CMSContent[];
  filterStatus: CMSContentStatus | null;
  filterType: CMSContentType | null;
  searchQuery: string;

  setFilterStatus: (s: CMSContentStatus | null) => void;
  setFilterType: (t: CMSContentType | null) => void;
  setSearchQuery: (q: string) => void;

  addItem: (item: Omit<CMSContent, 'id' | 'createdAt' | 'updatedAt'>) => CMSContent;
  updateItem: (id: string, patch: Partial<CMSContent>) => void;
  deleteItem: (id: string) => void;
  duplicateItem: (id: string) => CMSContent;
  publishItem: (id: string) => void;
  archiveItem: (id: string) => void;
  submitForReview: (id: string) => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      items: MOCK_CONTENT,
      filterStatus: null,
      filterType: null,
      searchQuery: '',

      setFilterStatus: (s) => set({ filterStatus: s }),
      setFilterType: (t) => set({ filterType: t }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      addItem: (data) => {
        const item: CMSContent = {
          ...data,
          id: `cms-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ items: [item, ...s.items] }));
        return item;
      },

      updateItem: (id, patch) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...patch, updatedAt: new Date().toISOString() } : i
          ),
        }));
      },

      deleteItem: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      },

      duplicateItem: (id) => {
        const original = get().items.find((i) => i.id === id);
        if (!original) throw new Error('Item not found');
        const copy: CMSContent = {
          ...original,
          id: `cms-${Date.now()}`,
          title: `${original.title} (Copy)`,
          slug: `${original.slug}-copy`,
          status: 'draft',
          publishedAt: null,
          scheduledAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((s) => ({ items: [copy, ...s.items] }));
        return copy;
      },

      publishItem: (id) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? { ...i, status: 'published', publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : i
          ),
        }));
      },

      archiveItem: (id) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, status: 'archived', updatedAt: new Date().toISOString() } : i
          ),
        }));
      },

      submitForReview: (id) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, status: 'in_review', updatedAt: new Date().toISOString() } : i
          ),
        }));
      },
    }),
    { name: 'northstar-cms-store' }
  )
);
