import { TourStep } from '@/components/ui/ProductTour';

export const DASHBOARD_TOUR: TourStep[] = [
  {
    title: 'Welcome to your Dashboard',
    description:
      'This is your command centre. See active projects, OKR health, team activity, and key metrics all in one place.',
  },
  {
    title: 'Product Vision',
    description:
      'Your team vision sits at the top to keep everyone aligned. You can edit this in Settings.',
    target: '.vision-banner',
  },
  {
    title: 'Quick Stats',
    description:
      'Track active projects, OKR progress, overdue items, and team velocity at a glance.',
  },
  {
    title: 'Recent Activity',
    description:
      'Stay up to date with the latest changes across your workspace — new projects, OKR check-ins, and team updates.',
  },
];

export const TIMELINES_TOUR: TourStep[] = [
  {
    title: 'Timelines & Gantt Charts',
    description:
      'Plan and visualise your delivery roadmap. Switch between Gantt, Table, and Board views to see your projects from different angles.',
  },
  {
    title: 'Add Projects',
    description:
      'Click the "+" button to add new projects, milestones, or tasks. Set dates, owners, priorities, and track progress.',
  },
  {
    title: 'Interactive Gantt',
    description:
      'Drag bars to adjust dates, click items for detail editing, and use the zoom controls to change your time scale.',
  },
];

export const OKRS_TOUR: TourStep[] = [
  {
    title: 'Objectives & Key Results',
    description:
      'Set measurable goals for your team. Each objective can have multiple key results with different metric types and weights.',
  },
  {
    title: 'Live & Draft Tabs',
    description:
      'Use Draft mode to plan OKRs before making them official. Move them to Live when ready.',
  },
  {
    title: 'Check-ins',
    description:
      'Update progress on key results with regular check-ins. Add notes and the confidence level auto-adjusts.',
  },
  {
    title: 'Password Protection',
    description:
      'Optionally password-protect sensitive objectives so only authorised team members can view the key results.',
  },
];

export const SUGGESTIONS_TOUR: TourStep[] = [
  {
    title: 'AI-Powered Suggestions',
    description:
      'Northstar scans your JIRA, Confluence, and Slack to surface items that might belong on your roadmap.',
  },
  {
    title: 'Review & Triage',
    description:
      'Accept suggestions to add them to your timeline, defer them for later review, or dismiss irrelevant ones.',
  },
  {
    title: 'Run a Scan',
    description:
      'Click "Run Scan" to trigger an immediate scan of your connected tools. Admins can configure automated scan schedules.',
  },
  {
    title: 'Setting Up Scans',
    description:
      'Scans require JIRA, Confluence, and Slack MCP integrations to be configured in Claude Code. Ask your workspace admin if the scan button is greyed out.',
  },
];

export const ROADMAP_TOUR: TourStep[] = [
  {
    title: 'Visual Roadmap',
    description:
      'A sprint-based view of your roadmap. Drag tickets between sprints, manage capacity, and keep your team on track.',
  },
  {
    title: 'Sprint Capacity',
    description:
      'Each sprint shows dev and UX capacity. Adjust these with the +/- buttons to match your team size.',
  },
  {
    title: 'Add Tasks',
    description:
      'Click "Add Task" in any sprint to create a new ticket. Assign it to a project and team (DEV or UX).',
  },
];

export const SETTINGS_TOUR: TourStep[] = [
  {
    title: 'Settings',
    description:
      'Manage your profile, workspace, team members, departments, and application preferences.',
  },
  {
    title: 'Team Members',
    description:
      'Add and manage team members who can be assigned to projects, OKRs, and tasks.',
  },
];
