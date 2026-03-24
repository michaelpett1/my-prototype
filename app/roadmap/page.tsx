'use client';
import { useState } from 'react';
import { Plus, Maximize2 } from 'lucide-react';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { ItemDetailPanel } from '@/components/timelines/ItemDetailPanel';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/lib/store/projectsStore';
import type { TimelineItem } from '@/lib/types';
import { SWIMLANE_THEMES } from '@/lib/utils/colorUtils';
import { clsx } from '@/lib/utils/clsx';

// Quarters based on today
function getCurrentQuarters(): string[] {
  const today = new Date();
  const year = today.getFullYear();
  const q = Math.ceil((today.getMonth() + 1) / 3);
  const quarters: string[] = [];
  for (let i = 0; i < 4; i++) {
    const qi = ((q - 1 + i) % 4) + 1;
    const yr = year + Math.floor((q - 1 + i) / 4);
    quarters.push(`${yr} Q${qi}`);
  }
  return quarters;
}

function getItemQuarter(item: TimelineItem): string {
  const d = new Date(item.startDate);
  const year = d.getFullYear();
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `${year} Q${q}`;
}

function getItemTheme(item: TimelineItem): string {
  // Assign theme by tags
  for (const theme of SWIMLANE_THEMES) {
    if (item.tags.includes(theme.label.toLowerCase())) return theme.label;
  }
  // Fallback by project type
  const tagMap: Record<string, string> = {
    growth: 'Growth',
    mobile: 'Mobile',
    platform: 'Platform',
    data: 'Retention',
    ux: 'Conversion',
    design: 'Conversion',
    engineering: 'Platform',
  };
  for (const tag of item.tags) {
    if (tagMap[tag]) return tagMap[tag];
  }
  return SWIMLANE_THEMES[0].label;
}

export default function RoadmapPage() {
  const { items, selectedItemId, selectItem, updateItem } = useProjectsStore();
  const [presentMode, setPresentMode] = useState(false);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);

  const quarters = getCurrentQuarters();
  const selectedItem = selectedItemId ? items.find((i) => i.id === selectedItemId) ?? null : null;

  // Only show top-level items (projects + milestones)
  const roadmapItems = items.filter((i) => i.type === 'project' || i.type === 'milestone');

  const handleDrop = (e: React.DragEvent, theme: string, quarter: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    // We don't actually change dates here, just move visually
    // In a real app this would recalculate dates
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  return (
    <div className={clsx('flex flex-col h-full', presentMode && 'bg-slate-900')}>
      {/* Toolbar */}
      {!presentMode && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-white shrink-0">
          <h1 className="text-sm font-semibold text-slate-800">Visual Roadmap</h1>
          <div className="h-4 w-px bg-slate-200" />

          {/* Theme filter */}
          <div className="flex items-center gap-1">
            {[null, ...SWIMLANE_THEMES.map((t) => t.label)].map((theme) => (
              <button
                key={theme ?? 'all'}
                onClick={() => setFilterTheme(theme)}
                className={clsx(
                  'px-2.5 py-1.5 rounded text-xs font-medium transition-colors',
                  filterTheme === theme
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {theme ?? 'All'}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={() => setPresentMode(true)}>
            <Maximize2 size={14} />
            Present
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={14} />
            Add Item
          </Button>
        </div>
      )}

      {/* Present mode overlay */}
      {presentMode && (
        <div className="flex items-center justify-between px-6 py-3 shrink-0">
          <h1 className="text-lg font-semibold text-white">Product Roadmap</h1>
          <button
            onClick={() => setPresentMode(false)}
            className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded border border-slate-600 transition-colors"
          >
            Exit Presentation
          </button>
        </div>
      )}

      {/* Swimlane grid */}
      <div className="flex-1 overflow-auto">
        <div
          className={clsx(
            'min-w-[900px]',
            presentMode ? 'p-6' : 'p-4'
          )}
        >
          {/* Column headers (quarters) */}
          <div className="flex">
            <div className="w-36 shrink-0" />
            <div className="flex-1 grid gap-px" style={{ gridTemplateColumns: `repeat(${quarters.length}, 1fr)` }}>
              {quarters.map((q) => (
                <div
                  key={q}
                  className={clsx(
                    'text-center text-xs font-semibold py-2.5 rounded-t-lg',
                    presentMode
                      ? 'text-white bg-slate-800'
                      : 'text-slate-600 bg-slate-100 border border-b-0 border-slate-200'
                  )}
                >
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* Swimlane rows */}
          {SWIMLANE_THEMES
            .filter((t) => !filterTheme || t.label === filterTheme)
            .map((theme) => {
              const themeItems = roadmapItems.filter((i) => getItemTheme(i) === theme.label);
              if (themeItems.length === 0 && filterTheme !== theme.label) return null;

              return (
                <div key={theme.label} className="flex mb-1">
                  {/* Row label */}
                  <div
                    className={clsx(
                      'w-36 shrink-0 flex items-start pt-3 pr-3',
                      presentMode ? '' : ''
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
                      <span className={clsx(
                        'text-xs font-semibold',
                        presentMode ? 'text-slate-300' : 'text-slate-600'
                      )}>
                        {theme.label}
                      </span>
                    </div>
                  </div>

                  {/* Quarter cells */}
                  <div
                    className="flex-1 grid gap-px"
                    style={{ gridTemplateColumns: `repeat(${quarters.length}, 1fr)` }}
                  >
                    {quarters.map((q) => {
                      const cellItems = themeItems.filter((i) => getItemQuarter(i) === q);
                      return (
                        <div
                          key={q}
                          className={clsx(
                            'min-h-[80px] p-2 rounded space-y-1.5 border',
                            presentMode
                              ? 'bg-slate-800 border-slate-700'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          )}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => handleDrop(e, theme.label, q)}
                        >
                          {cellItems.map((item) => (
                            <RoadmapCard
                              key={item.id}
                              item={item}
                              onClick={() => selectItem(item.id)}
                              onDragStart={handleDragStart}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Detail panel */}
      {!presentMode && (
        <ItemDetailPanel item={selectedItem} onClose={() => selectItem(null)} />
      )}
    </div>
  );
}
