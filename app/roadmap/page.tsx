'use client';
import { useState } from 'react';
import { Plus, Maximize2, Minimize2 } from 'lucide-react';
import { RoadmapCard } from '@/components/roadmap/RoadmapCard';
import { ItemDetailPanel } from '@/components/timelines/ItemDetailPanel';
import { Button } from '@/components/ui/Button';
import { useProjectsStore } from '@/lib/store/projectsStore';
import type { TimelineItem } from '@/lib/types';
import { SWIMLANE_THEMES } from '@/lib/utils/colorUtils';
import { clsx } from '@/lib/utils/clsx';

function getCurrentQuarters(): string[] {
  const today = new Date();
  const year = today.getFullYear();
  const q = Math.ceil((today.getMonth() + 1) / 3);
  return Array.from({ length: 4 }, (_, i) => {
    const qi = ((q - 1 + i) % 4) + 1;
    const yr = year + Math.floor((q - 1 + i) / 4);
    return `${yr} Q${qi}`;
  });
}

function getItemQuarter(item: TimelineItem): string {
  const d = new Date(item.startDate);
  return `${d.getFullYear()} Q${Math.ceil((d.getMonth() + 1) / 3)}`;
}

function getItemTheme(item: TimelineItem): string {
  const map: Record<string, string> = {
    growth: 'Growth', mobile: 'Mobile', platform: 'Platform',
    data: 'Retention', ux: 'Conversion', design: 'Conversion', engineering: 'Platform',
  };
  for (const tag of item.tags) {
    if (map[tag]) return map[tag];
  }
  return SWIMLANE_THEMES[0].label;
}

export default function RoadmapPage() {
  const { items, selectedItemId, selectItem } = useProjectsStore();
  const [presentMode, setPresentMode] = useState(false);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);

  const quarters = getCurrentQuarters();
  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) ?? null : null;
  const roadmapItems = items.filter(i => i.type === 'project' || i.type === 'milestone');

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: presentMode ? '#0F172A' : '#FAFAF9' }}
    >
      {/* Toolbar */}
      {!presentMode && (
        <div
          className="flex items-center gap-3 px-4 py-2 shrink-0 flex-wrap"
          style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.07)', minHeight: 44 }}
        >
          <span className="text-[13px] font-semibold" style={{ color: '#1C1917' }}>Visual Roadmap</span>
          <div className="w-px h-4" style={{ background: 'rgba(0,0,0,0.08)' }} />

          {/* Theme filter chips */}
          <div className="flex items-center gap-0.5">
            {[null, ...SWIMLANE_THEMES.map(t => t.label)].map(theme => (
              <button
                key={theme ?? 'all'}
                onClick={() => setFilterTheme(theme)}
                className="px-2.5 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-150"
                style={filterTheme === theme
                  ? { background: '#2563EB', color: '#FFFFFF' }
                  : { color: '#6B7280' }
                }
                onMouseEnter={e => {
                  if (filterTheme !== theme) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.04)';
                }}
                onMouseLeave={e => {
                  if (filterTheme !== theme) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                {theme ?? 'All'}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <Button variant="ghost" size="sm" onClick={() => setPresentMode(true)}>
            <Maximize2 size={13} /> Present
          </Button>
          <Button variant="primary" size="sm">
            <Plus size={13} /> Add Item
          </Button>
        </div>
      )}

      {/* Present mode header */}
      {presentMode && (
        <div className="flex items-center justify-between px-8 py-4 shrink-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#475569', letterSpacing: '0.1em' }}>
              Product Roadmap
            </p>
            <h1 className="text-[20px] font-semibold mt-0.5" style={{ color: '#F1F5F9', letterSpacing: '-0.01em' }}>
              {new Date().getFullYear()} — {quarters[quarters.length - 1]}
            </h1>
          </div>
          <button
            onClick={() => setPresentMode(false)}
            className="flex items-center gap-1.5 text-[12px] rounded-[5px] transition-all duration-150"
            style={{ padding: '6px 12px', color: '#64748B', border: '1px solid #1E293B' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94A3B8'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748B'; }}
          >
            <Minimize2 size={13} /> Exit
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className="min-w-[800px]">
          {/* Quarter headers */}
          <div className="flex mb-1" style={{ paddingLeft: 140 }}>
            {quarters.map(q => (
              <div
                key={q}
                className="flex-1 text-center text-[11px] font-semibold rounded-[4px] mx-0.5 py-2"
                style={presentMode
                  ? { background: 'rgba(255,255,255,0.06)', color: '#94A3B8', letterSpacing: '0.04em' }
                  : { background: 'rgba(0,0,0,0.04)', color: '#9CA3AF', letterSpacing: '0.04em' }
                }
              >
                {q}
              </div>
            ))}
          </div>

          {/* Swimlane rows */}
          {SWIMLANE_THEMES
            .filter(t => !filterTheme || t.label === filterTheme)
            .map(theme => {
              const themeItems = roadmapItems.filter(i => getItemTheme(i) === theme.label);
              if (themeItems.length === 0 && filterTheme !== theme.label) return null;

              return (
                <div key={theme.label} className="flex mb-1">
                  {/* Row label */}
                  <div className="shrink-0 flex items-start pt-3 pr-3" style={{ width: 140 }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-[8px] h-[8px] rounded-full" style={{ background: theme.color }} />
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: presentMode ? '#64748B' : '#9CA3AF', letterSpacing: '0.02em' }}
                      >
                        {theme.label}
                      </span>
                    </div>
                  </div>

                  {/* Quarter cells */}
                  {quarters.map(q => {
                    const cellItems = themeItems.filter(i => getItemQuarter(i) === q);
                    return (
                      <div
                        key={q}
                        className="flex-1 mx-0.5 p-2 rounded-[5px] space-y-1.5 min-h-[80px]"
                        style={presentMode
                          ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }
                          : { background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.07)' }
                        }
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => e.preventDefault()}
                      >
                        {cellItems.map(item => (
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
              );
            })}
        </div>
      </div>

      {!presentMode && <ItemDetailPanel item={selectedItem} onClose={() => selectItem(null)} />}
    </div>
  );
}
