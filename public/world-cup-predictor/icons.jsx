// World Cup Predictor — shared icons + small components

const Icon = ({ name, size = 22 }) => {
  const paths = {
    home: <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-8.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />,
    trophy: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12v6a6 6 0 0 1-12 0V4z"/><path d="M6 6H3a3 3 0 0 0 3 3M18 6h3a3 3 0 0 1-3 3M9 17h6M10 17v3h4v-3"/></g>,
    bracket: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h6v4M3 18h6v-4M9 8h4v8h4M21 12h-4"/></g>,
    leaderboard: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></g>,
    user: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></g>,
    bell: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7zM10 19a2 2 0 0 0 4 0"/></g>,
    menu: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></g>,
    chevron: <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    chevronL: <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    plus: <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    check: <path d="M5 13l4 4 10-10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    flame: <path d="M12 3s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 1-3 0 2 1 3 2 3 0-3-2-4-2-7 1 1 2 1 3-1z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>,
    arrowUp: <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    arrowDown: <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>,
    share: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/></g>,
    info: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v6"/></g>,
    lock: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></g>,
    gift: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="5"/><path d="M3 13v8h18v-8M12 8v13M8 8a2 2 0 1 1 0-4c2 0 4 4 4 4M16 8a2 2 0 1 0 0-4c-2 0-4 4-4 4"/></g>,
    target: <g stroke="currentColor" strokeWidth="2" fill="none"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></g>,
    star: <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 5.5-5-2.7-5 2.7 1-5.5-4-4 5.5-1z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>,
    settings: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></g>,
    book: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2V5z"/><path d="M19 17H6a2 2 0 0 0-2 2"/></g>,
    users: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3 3-5 6.5-5s6.5 2 6.5 5"/><circle cx="17" cy="9" r="3"/><path d="M14 20c0-3 3-5 7-5"/></g>,
    x: <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>,
    coin: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M14.5 9c-.5-1-1.5-1.5-2.5-1.5S9 8 9 9.5s1 2 2.5 2.5 3 1 3 2.5-1 2-2.5 2-2-.5-2.5-1.5M12 6.5v1M12 16.5v1"/></g>,
    medal: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3l2 7M16 3l-2 7"/><circle cx="12" cy="15" r="6"/><path d="M9.5 14l1 2.5 1.5-3.5 1.5 3.5 1-2.5"/></g>,
    calendar: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></g>,
    acca: <g stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8" cy="10" r="0.8" fill="currentColor"/><circle cx="12" cy="14" r="0.8" fill="currentColor"/><circle cx="16" cy="10" r="0.8" fill="currentColor"/></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

const Flag = ({ code }) => {
  const t = window.WC_DATA.TEAMS[code];
  if (!t) return null;
  return <span style={{fontSize: 22, lineHeight: 1}}>{t.flag}</span>;
};

const TrendIcon = ({ trend, delta }) => {
  if (trend === 'up') return <span className="lb-trend up"><Icon name="arrowUp" size={10}/>{delta || ''}</span>;
  if (trend === 'down') return <span className="lb-trend down"><Icon name="arrowDown" size={10}/>{delta || ''}</span>;
  return <span className="lb-trend flat" aria-label="No change">—</span>;
};

window.Icon = Icon;
window.Flag = Flag;
window.TrendIcon = TrendIcon;
