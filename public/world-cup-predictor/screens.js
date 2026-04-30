// World Cup Predictor — Screens

const {
  useState,
  useMemo,
  useEffect
} = React;

// localStorage-backed pick store. Every FixtureCard reads/writes the same
// source of truth so picks survive navigation and reload.
const PICKS_KEY = 'wcp.picks.v1';
function loadPicks() {
  try {
    return JSON.parse(localStorage.getItem(PICKS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}
function savePicks(p) {
  try {
    localStorage.setItem(PICKS_KEY, JSON.stringify(p));
  } catch (e) {}
}
function setPick(id, h, a) {
  const all = loadPicks();
  if (h === '' && a === '') delete all[id];else all[id] = {
    h,
    a
  };
  savePicks(all);
  window.dispatchEvent(new Event('wcp:picks-changed'));
}
function getStoredPick(id) {
  return loadPicks()[id];
}
function usePicksVersion() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const h = () => force(n => n + 1);
    window.addEventListener('wcp:picks-changed', h);
    return () => window.removeEventListener('wcp:picks-changed', h);
  }, []);
}

// =================== TOP NAV (Gambling.com style) ===================
const TopBar = ({
  onSignup
}) => /*#__PURE__*/React.createElement("div", {
  className: "gc-topbar"
}, /*#__PURE__*/React.createElement("div", {
  className: "gc-topbar-inner"
}, /*#__PURE__*/React.createElement("a", {
  className: "gc-brand"
}, /*#__PURE__*/React.createElement("div", {
  className: "mark"
}, "G"), /*#__PURE__*/React.createElement("div", {
  className: "name"
}, "Gambling", /*#__PURE__*/React.createElement("span", null, ".com"))), /*#__PURE__*/React.createElement("nav", {
  className: "gc-topnav"
}, /*#__PURE__*/React.createElement("a", null, "Casino"), /*#__PURE__*/React.createElement("a", null, "Sportsbook"), /*#__PURE__*/React.createElement("a", null, "Poker"), /*#__PURE__*/React.createElement("a", null, "Bingo"), /*#__PURE__*/React.createElement("a", null, "News"), /*#__PURE__*/React.createElement("a", {
  className: "active"
}, "World Cup"), /*#__PURE__*/React.createElement("a", null, "Bonuses")), /*#__PURE__*/React.createElement("div", {
  className: "gc-topbar-actions"
}, /*#__PURE__*/React.createElement("button", {
  className: "btn btn-secondary btn-sm",
  onClick: onSignup
}, "Log in"), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-sm",
  onClick: onSignup
}, "Sign up"))));

// =================== GAME SUB-NAV ===================
const SubNav = ({
  active,
  setActive
}) => {
  const items = [{
    id: 'home',
    label: 'Overview',
    icon: 'home'
  }, {
    id: 'predict',
    label: 'Predictions',
    icon: 'target'
  }, {
    id: 'bracket',
    label: 'Knockout bracket',
    icon: 'bracket'
  }, {
    id: 'outrights',
    label: 'Outrights',
    icon: 'trophy'
  }, {
    id: 'leagues',
    label: 'Leaderboards',
    icon: 'leaderboard'
  }, {
    id: 'prizes',
    label: 'Prizes',
    icon: 'medal'
  }, {
    id: 'how',
    label: 'How it works',
    icon: 'info'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "gc-subnav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "gc-subnav-inner"
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    onClick: () => setActive(it.id),
    className: active === it.id ? 'active' : ''
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 16
  }), it.label))));
};

// (Legacy AppHeader / BottomNav stubs — left as no-ops for compatibility)
const AppHeader = () => null;
const BottomNav = () => null;

// Live countdown to next fixture lock — re-renders every second.
function useCountdown(target) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor(diff / 3600000 % 24);
  const mins = Math.floor(diff / 60000 % 60);
  const secs = Math.floor(diff / 1000 % 60);
  const pad = n => String(n).padStart(2, '0');
  return {
    days: pad(days),
    hrs: pad(hrs),
    mins: pad(mins),
    secs: pad(secs),
    done: diff === 0
  };
}

// =================== HOME / LANDING ===================
const HomeScreen = ({
  setActive
}) => {
  const {
    FIXTURES,
    LEADERBOARD,
    ME
  } = window.WC_DATA;
  const live = FIXTURES.find(f => f.status === 'live');
  const upcoming = FIXTURES.filter(f => f.status === 'open' && !f.myPick).slice(0, 3);
  const me = LEADERBOARD.find(l => l.me);

  // Anchor the countdown to a fixed instant computed once on mount so it
  // always reads ~2 days out and visibly ticks. This avoids drift between
  // re-renders.
  const lockTarget = React.useRef(Date.now() + 2 * 86400000 + 14 * 3600000 + 22 * 60000).current;
  const cd = useCountdown(lockTarget);
  const handleNav = id => e => {
    e.preventDefault();
    setActive(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wc-hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "wc-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "eyebrow"
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), "Tournament live \xB7 Matchday 1"), /*#__PURE__*/React.createElement("h1", null, "Pick smart. Win ", /*#__PURE__*/React.createElement("em", null, "big.")), /*#__PURE__*/React.createElement("p", {
    className: "lede"
  }, "Predict every match of the FIFA World Cup 2026. Free to play. \xA310,000 in prizes for the sharpest minds \u2014 courtesy of the team at Gambling.com."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginTop: 22,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn",
    onClick: handleNav('predict')
  }, "Make your picks \u2192"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn btn-secondary",
    style: {
      background: 'rgba(255,255,255,0.10)',
      color: '#fff',
      borderColor: 'transparent'
    },
    onClick: handleNav('how')
  }, "How it works"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "countdown",
    "aria-live": "polite"
  }, /*#__PURE__*/React.createElement("div", {
    className: "cd-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, cd.days), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Days")), /*#__PURE__*/React.createElement("div", {
    className: "cd-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, cd.hrs), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Hrs")), /*#__PURE__*/React.createElement("div", {
    className: "cd-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, cd.mins), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Min")), /*#__PURE__*/React.createElement("div", {
    className: "cd-cell"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, cd.secs), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Sec"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      marginTop: 10,
      opacity: 0.75,
      letterSpacing: '0.1em',
      textAlign: 'center'
    }
  }, "UNTIL NEXT FIXTURE LOCKS"), /*#__PURE__*/React.createElement("div", {
    className: "stat-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, ME.pts), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Your pts")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "#", ME.rank), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Global")), /*#__PURE__*/React.createElement("div", {
    className: "stat"
  }, /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, ME.groupPicks.done, "/", ME.groupPicks.total), /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Picks set")))))), /*#__PURE__*/React.createElement("div", {
    className: "home-body",
    style: {
      padding: '24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "home-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 700
    }
  }, "Predictions due"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-more",
    onClick: handleNav('predict')
  }, "See all \u2192")), live && /*#__PURE__*/React.createElement(FixtureCard, {
    fixture: live,
    compact: true
  }), upcoming.map(f => /*#__PURE__*/React.createElement(FixtureCard, {
    key: f.id,
    fixture: f
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 17,
      fontWeight: 700
    }
  }, "Top of the table"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-more",
    onClick: handleNav('leagues')
  }, "Full board \u2192")), LEADERBOARD.slice(0, 6).map(r => /*#__PURE__*/React.createElement(LeaderRow, {
    key: r.rank,
    row: r
  })), /*#__PURE__*/React.createElement(LeaderRow, {
    row: me
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '16px 0 0'
    }
  }, /*#__PURE__*/React.createElement(DailyAccaCard, null))))));
};

// =================== FIXTURE CARD ===================
const FixtureCard = ({
  fixture: f,
  compact,
  onUpdate
}) => {
  const {
    TEAMS
  } = window.WC_DATA;
  const home = TEAMS[f.home];
  const away = TEAMS[f.away];
  const stored = getStoredPick(f.id);
  const initial = stored || f.myPick || {
    h: '',
    a: ''
  };
  const [h, setH] = useState(initial.h ?? '');
  const [a, setA] = useState(initial.a ?? '');
  const writeBack = (nh, na) => {
    if (f.status === 'open') setPick(f.id, nh, na);
    onUpdate?.(f.id, nh, na);
  };
  const isLive = f.status === 'live';
  const isFinal = f.status === 'final';
  const hasPick = h !== '' && a !== '';
  const partial = (h !== '' || a !== '') && !hasPick;
  const clampScore = raw => {
    const digits = raw.replace(/\D/g, '').slice(0, 2);
    if (digits === '') return '';
    return String(Math.min(20, parseInt(digits, 10)));
  };
  const handleBlur = () => {
    if (partial) {
      setH('');
      setA('');
      writeBack('', '');
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: `fixture ${isLive ? 'is-live' : ''} ${isFinal ? 'is-locked' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "fixture-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "grp"
  }, isLive ? /*#__PURE__*/React.createElement("span", {
    className: "tag live"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ld"
  }), "Live") : null, isFinal ? /*#__PURE__*/React.createElement("span", {
    className: "tag locked"
  }, "Final") : null, /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: isLive || isFinal ? 8 : 0
    }
  }, "Group ", f.group, " \xB7 MD", f.md || 1)), /*#__PURE__*/React.createElement("span", {
    className: "kickoff"
  }, f.kickoff, " \xB7 ", f.date)), /*#__PURE__*/React.createElement("div", {
    className: "fixture-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "team"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flag"
  }, home.flag), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, home.name), /*#__PURE__*/React.createElement("div", {
    className: "form"
  }, "FORM \xB7 ", home.form)), isLive ? /*#__PURE__*/React.createElement("div", {
    className: "score-input",
    style: {
      flexDirection: 'column',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "live-score"
  }, f.live.h, "\u2013", f.live.a), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      color: 'var(--gdc-red-600)',
      letterSpacing: '0.1em',
      fontWeight: 700
    }
  }, "67' 2ND HALF")) : isFinal ? /*#__PURE__*/React.createElement("div", {
    className: "score-input"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'var(--gdc-gray-1000)'
    }
  }, f.actual.h, "\u2013", f.actual.a)) : /*#__PURE__*/React.createElement("div", {
    className: "score-input"
  }, /*#__PURE__*/React.createElement("input", {
    className: `score-box ${h !== '' ? 'set' : ''}`,
    value: h,
    onChange: e => {
      const v = clampScore(e.target.value);
      setH(v);
      writeBack(v, a);
    },
    onBlur: handleBlur,
    inputMode: "numeric",
    pattern: "[0-9]*",
    maxLength: 2,
    placeholder: "\u2013",
    "aria-label": `${home.name} score`
  }), /*#__PURE__*/React.createElement("span", {
    className: "vs"
  }, "VS"), /*#__PURE__*/React.createElement("input", {
    className: `score-box ${a !== '' ? 'set' : ''}`,
    value: a,
    onChange: e => {
      const v = clampScore(e.target.value);
      setA(v);
      writeBack(h, v);
    },
    onBlur: handleBlur,
    inputMode: "numeric",
    pattern: "[0-9]*",
    maxLength: 2,
    placeholder: "\u2013",
    "aria-label": `${away.name} score`
  })), /*#__PURE__*/React.createElement("div", {
    className: "team"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flag"
  }, away.flag), /*#__PURE__*/React.createElement("div", {
    className: "name"
  }, away.name), /*#__PURE__*/React.createElement("div", {
    className: "form"
  }, "FORM \xB7 ", away.form))), !compact && !isFinal && /*#__PURE__*/React.createElement("div", {
    className: "fixture-extras"
  }, /*#__PURE__*/React.createElement("span", null, isLive ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 12
  }), " \xA0Locked at kick-off") : hasPick ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 12
  }), " \xA0Pick saved") : partial ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gdc-red-600)',
      fontWeight: 600
    }
  }, "Pick incomplete \u2014 enter both scores") : 'Tap a box to predict'), /*#__PURE__*/React.createElement("span", {
    className: "points"
  }, "Up to ", /*#__PURE__*/React.createElement("b", null, "3 pts"))), isFinal && /*#__PURE__*/React.createElement("div", {
    className: "result-line"
  }, /*#__PURE__*/React.createElement("span", {
    className: "actual"
  }, "Your pick: ", /*#__PURE__*/React.createElement("b", null, f.myPick.h, "\u2013", f.myPick.a), " \xB7 Actual ", /*#__PURE__*/React.createElement("b", null, f.actual.h, "\u2013", f.actual.a)), f.rule === 'exact' && /*#__PURE__*/React.createElement("span", {
    className: "pts win"
  }, "Exact \xB7 +3 pts"), f.rule === 'result' && /*#__PURE__*/React.createElement("span", {
    className: "pts",
    style: {
      background: '#FFF6E5',
      color: '#B26B00'
    }
  }, "Result \xB7 +1 pt"), f.rule === 'miss' && /*#__PURE__*/React.createElement("span", {
    className: "pts loss"
  }, "Miss \xB7 0 pts")));
};

// =================== PREDICT SCREEN ===================
const PredictScreen = () => {
  const {
    FIXTURES
  } = window.WC_DATA;
  const [tab, setTab] = useState('upcoming');
  const [group, setGroup] = useState('ALL');
  usePicksVersion();
  const groupsInData = useMemo(() => {
    const seen = new Set(FIXTURES.map(f => f.group));
    return ['ALL', ...Array.from(seen).sort()];
  }, [FIXTURES]);
  const matchesGroup = f => group === 'ALL' || f.group === group;
  const upcoming = FIXTURES.filter(f => f.status === 'open' && matchesGroup(f));
  const live = FIXTURES.filter(f => f.status === 'live' && matchesGroup(f));
  const finals = FIXTURES.filter(f => f.status === 'final' && matchesGroup(f));
  const totalUpcoming = FIXTURES.filter(f => f.status === 'open' || f.status === 'live').length;
  const totalFinals = FIXTURES.filter(f => f.status === 'final').length;
  const list = tab === 'upcoming' ? [...live, ...upcoming] : finals;
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Predict"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Lock in your scores before kick-off"))), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: tab === 'upcoming' ? 'active' : '',
    onClick: () => setTab('upcoming')
  }, "Upcoming \xB7 ", totalUpcoming), /*#__PURE__*/React.createElement("button", {
    className: tab === 'finals' ? 'active' : '',
    onClick: () => setTab('finals')
  }, "Results \xB7 ", totalFinals)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 18px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "chip-row",
    style: {
      padding: 0,
      marginBottom: 12
    }
  }, groupsInData.map(g => /*#__PURE__*/React.createElement("button", {
    key: g,
    className: `chip ${group === g ? 'active' : ''}`,
    onClick: () => setGroup(g)
  }, g === 'ALL' ? 'All groups' : g)))), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 0
    }
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, "No fixtures match this filter.") : list.map(f => /*#__PURE__*/React.createElement(FixtureCard, {
    key: f.id,
    fixture: f
  }))), tab === 'upcoming' && /*#__PURE__*/React.createElement("div", {
    className: "sticky-cta"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-block",
    onClick: () => {
      const ev = new CustomEvent('wcp:toast', {
        detail: 'Predictions saved'
      });
      window.dispatchEvent(ev);
    }
  }, "Submit predictions"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: 'var(--gdc-gray-650)',
      marginTop: 6
    }
  }, "Auto-saves as you type. Locks at kick-off.")));
};

// =================== BRACKET ===================
const BracketScreen = () => {
  const {
    TEAMS,
    KNOCKOUT
  } = window.WC_DATA;
  const order = ['R32', 'R16', 'QF', 'SF', 'F'];
  const accent = {
    open: 'var(--gdc-blue-600)',
    tbd: 'var(--gdc-gray-450)',
    locked: 'var(--gdc-gray-450)'
  };

  // Round filter for narrow viewports — defaults to "all" on desktop. The CSS
  // hides the picker above 720px so the desktop horizontal-scroll grid stays.
  const [activeRound, setActiveRound] = React.useState('R32');
  const isMobile = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(max-width: 720px)').matches : false;
  const [mobile, setMobile] = React.useState(isMobile);
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 720px)');
    const h = () => setMobile(mq.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);
  const visibleRounds = mobile ? [activeRound] : order;
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Knockout bracket"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Rounds unlock as the previous round completes \xB7 3 pts exact \xB7 1 pt result"))), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 4,
      paddingBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Knockout pts so far"), /*#__PURE__*/React.createElement("div", {
    className: "v blue"
  }, "0"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "R32 unlocks first \xB7 predict now")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "R32 picks"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "5 / 8"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "3 fixtures still open")))), /*#__PURE__*/React.createElement("div", {
    className: "bracket-round-picker",
    role: "tablist",
    "aria-label": "Knockout round"
  }, order.map(key => {
    const r = KNOCKOUT[key];
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      role: "tab",
      "aria-selected": activeRound === key,
      className: `brp-btn ${activeRound === key ? 'active' : ''} state-${r.state}`,
      onClick: () => setActiveRound(key)
    }, r.label);
  })), /*#__PURE__*/React.createElement("div", {
    className: "bracket-grid"
  }, visibleRounds.map(key => {
    const r = KNOCKOUT[key];
    return /*#__PURE__*/React.createElement("div", {
      className: "round-col",
      key: key
    }, /*#__PURE__*/React.createElement("h3", null, r.label, r.state === 'open' && /*#__PURE__*/React.createElement("span", {
      className: "tag blue",
      style: {
        marginLeft: 8
      }
    }, "Open"), r.state === 'tbd' && /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        marginLeft: 8
      }
    }, "Awaiting teams"), r.state === 'locked' && /*#__PURE__*/React.createElement("span", {
      className: "tag locked",
      style: {
        marginLeft: 8
      }
    }, "Locked")), r.state !== 'open' && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: 'var(--gdc-gray-650)',
        margin: '-4px 0 12px',
        lineHeight: 1.4
      }
    }, "Unlocks after ", r.unlockedAfter), r.matches.map((m, mi) => {
      if (r.state === 'open') {
        const home = TEAMS[m.home];
        const away = TEAMS[m.away];
        const has = m.myPick;
        return /*#__PURE__*/React.createElement("div", {
          key: m.id,
          className: `bk-match ${has ? 'predicted' : ''}`
        }, /*#__PURE__*/React.createElement("div", {
          className: "bk-meta"
        }, m.kickoff), /*#__PURE__*/React.createElement("div", {
          className: `bk-team ${has && has.h > has.a ? 'win' : ''}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "t"
        }, /*#__PURE__*/React.createElement("span", {
          className: "fl"
        }, home.flag), home.short), /*#__PURE__*/React.createElement("span", {
          className: "s"
        }, has?.h ?? '–')), /*#__PURE__*/React.createElement("div", {
          className: `bk-team ${has && has.a > has.h ? 'win' : ''}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "t"
        }, /*#__PURE__*/React.createElement("span", {
          className: "fl"
        }, away.flag), away.short), /*#__PURE__*/React.createElement("span", {
          className: "s"
        }, has?.a ?? '–')), !has && /*#__PURE__*/React.createElement("button", {
          type: "button",
          className: "bk-cta"
        }, "Tap to predict \u2192"));
      }
      return /*#__PURE__*/React.createElement("div", {
        key: m.id,
        className: "bk-match",
        style: {
          opacity: r.state === 'locked' ? 0.55 : 1,
          background: '#FAFAFA'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "bk-meta"
      }, m.kickoff || 'TBD'), /*#__PURE__*/React.createElement("div", {
        className: "bk-team tbd"
      }, /*#__PURE__*/React.createElement("span", {
        className: "t",
        style: {
          fontStyle: 'italic',
          fontSize: 12
        }
      }, m.slot), /*#__PURE__*/React.createElement("span", {
        className: "s"
      }, "\u2013")), /*#__PURE__*/React.createElement("div", {
        className: "bk-team tbd"
      }, /*#__PURE__*/React.createElement("span", {
        className: "t",
        style: {
          fontStyle: 'italic',
          fontSize: 12,
          opacity: 0.6
        }
      }, "\u2014"), /*#__PURE__*/React.createElement("span", {
        className: "s"
      }, "\u2013")));
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "screen-section"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 18
  }), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Knockout scoring")), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      paddingLeft: 18,
      fontSize: 12.5,
      color: 'var(--gdc-gray-700)',
      lineHeight: 1.7
    }
  }, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "3 pts"), " for the exact final score (after extra time / penalties)"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("b", null, "1 pt"), " if you got the winner right but not the score"), /*#__PURE__*/React.createElement("li", null, "Drawn matches need a winner-on-penalties pick to score"), /*#__PURE__*/React.createElement("li", null, "Each fixture locks at its own kick-off \u2014 keep editing until then")))));
};

// =================== LEADERBOARD ROW ===================
const LeaderRow = ({
  row
}) => {
  if (!row) return null;
  const r = row.rank;
  const cls = r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';
  const initial = row.name === 'You' ? 'Y' : row.name.slice(0, 2).toUpperCase();
  return /*#__PURE__*/React.createElement("div", {
    className: `lb-row ${row.me ? 'me' : ''}`
  }, /*#__PURE__*/React.createElement("div", {
    className: `lb-rank ${cls}`
  }, "#", r), /*#__PURE__*/React.createElement("div", {
    className: "lb-avatar"
  }, initial), /*#__PURE__*/React.createElement("div", {
    className: "lb-name"
  }, row.name, /*#__PURE__*/React.createElement("span", {
    className: "h"
  }, row.loc)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lb-pts"
  }, row.pts), /*#__PURE__*/React.createElement(TrendIcon, {
    trend: row.trend
  })));
};

// =================== LEAGUES SCREEN ===================
const LeaguesScreen = () => {
  const {
    LEADERBOARD,
    LEAGUES
  } = window.WC_DATA;
  const [tab, setTab] = useState('global');
  const me = LEADERBOARD.find(l => l.me);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Leaderboards"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Global rankings + your private leagues")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary btn-sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Create")), /*#__PURE__*/React.createElement("div", {
    className: "tabs"
  }, /*#__PURE__*/React.createElement("button", {
    className: tab === 'global' ? 'active' : '',
    onClick: () => setTab('global')
  }, "Global"), /*#__PURE__*/React.createElement("button", {
    className: tab === 'leagues' ? 'active' : '',
    onClick: () => setTab('leagues')
  }, "My leagues \xB7 ", LEAGUES.length), /*#__PURE__*/React.createElement("button", {
    className: tab === 'friends' ? 'active' : '',
    onClick: () => setTab('friends')
  }, "Friends")), tab === 'global' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 12,
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lb-avatar",
    style: {
      width: 40,
      height: 40,
      fontSize: 13
    }
  }, "Y"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      fontSize: 13
    }
  }, "You \xB7 ", me.pts, " pts"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--gdc-gray-650)'
    }
  }, "Climb ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--gdc-blue-600)'
    }
  }, "147 places"), " to crack the Top 100")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--gdc-gray-650)',
      letterSpacing: '0.06em'
    }
  }, "RANK"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800
    }
  }, "#247")))), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 0
    }
  }, LEADERBOARD.filter(l => !l.me).slice(0, 10).map(r => /*#__PURE__*/React.createElement(LeaderRow, {
    key: r.rank,
    row: r
  })), /*#__PURE__*/React.createElement("div", {
    className: "empty",
    style: {
      padding: '14px'
    }
  }, "\u2026 236 more players ahead of you"), /*#__PURE__*/React.createElement(LeaderRow, {
    row: me
  }))), tab === 'leagues' && /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 12
    }
  }, LEAGUES.map(l => /*#__PURE__*/React.createElement("div", {
    className: "league-row",
    key: l.id
  }, /*#__PURE__*/React.createElement("div", {
    className: "league-icon"
  }, l.icon), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, l.name, " ", l.winning && /*#__PURE__*/React.createElement("span", {
    className: "tag win",
    style: {
      marginLeft: 6
    }
  }, "1ST")), /*#__PURE__*/React.createElement("div", {
    className: "meta"
  }, l.members, " members \xB7 MD1 active")), /*#__PURE__*/React.createElement("div", {
    className: "pos"
  }, /*#__PURE__*/React.createElement("b", null, "#", l.pos), "of ", l.total))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 8,
      gridTemplateColumns: '1fr 1fr',
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-secondary"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "plus",
    size: 14
  }), " Create league"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-ghost"
  }, "Join with code"))), tab === 'friends' && /*#__PURE__*/React.createElement("div", {
    className: "empty"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      marginBottom: 8
    }
  }, "\uD83D\uDC65"), "Add friends to compare picks", /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn"
  }, "Invite friends"))));
};

// =================== PROFILE / MY PICKS ===================
const ProfileScreen = ({
  openPrizes
}) => {
  const {
    LEADERBOARD,
    FIXTURES
  } = window.WC_DATA;
  const me = LEADERBOARD.find(l => l.me);
  const finals = FIXTURES.filter(f => f.status === 'final');
  const correct = finals.filter(f => f.earned > 0).length;
  const accuracy = Math.round(correct / finals.length * 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Your profile"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Cardiff, UK \xB7 Joined Apr 2026")), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    style: {
      background: 'var(--gdc-gray-100)',
      color: 'var(--gdc-gray-900)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 18,
      textAlign: 'center',
      background: 'linear-gradient(180deg,#F1F6FF, #fff)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "lb-avatar",
    style: {
      width: 64,
      height: 64,
      fontSize: 22,
      margin: '0 auto 10px'
    }
  }, "Y"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      fontSize: 18
    }
  }, "You"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gdc-gray-650)',
      marginBottom: 14
    }
  }, me.pts, " pts \xB7 Rank #", me.rank), /*#__PURE__*/React.createElement("div", {
    className: "grid-2",
    style: {
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "metric-card",
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Accuracy"), /*#__PURE__*/React.createElement("div", {
    className: "v blue"
  }, accuracy, "%"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, correct, "/", finals.length, " correct")), /*#__PURE__*/React.createElement("div", {
    className: "metric-card",
    style: {
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "l"
  }, "Streak"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, "2 \uD83D\uDD25"), /*#__PURE__*/React.createElement("div", {
    className: "d"
  }, "Best: 4 wins"))))), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, /*#__PURE__*/React.createElement("h2", null, "Recent results"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-more"
  }, "All \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 0
    }
  }, finals.map(f => /*#__PURE__*/React.createElement(FixtureCard, {
    key: f.id,
    fixture: f
  }))), /*#__PURE__*/React.createElement("div", {
    className: "section-title"
  }, /*#__PURE__*/React.createElement("h2", null, "Your prize tier"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "link-more",
    onClick: openPrizes
  }, "All prizes \u2192")), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "prize"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prize-medal s4"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "gift",
    size: 26
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, "Top 1,000 tier"), /*#__PURE__*/React.createElement("div", {
    className: "desc"
  }, "Currently #247 \xB7 stay in to qualify")), /*#__PURE__*/React.createElement("div", {
    className: "val"
  }, "\xA310"))));
};

// =================== PRIZES (modal-ish full screen) ===================
const PrizesScreen = ({
  onBack
}) => {
  const {
    PRIZE_POOLS
  } = window.WC_DATA;
  const totalPool = PRIZE_POOLS.reduce((sum, p) => sum + p.pool, 0);
  const totalLabel = '£' + totalPool.toLocaleString('en-GB');
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    onClick: onBack,
    style: {
      background: 'var(--gdc-gray-100)',
      color: 'var(--gdc-gray-900)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronL",
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      marginLeft: 12
    }
  }, /*#__PURE__*/React.createElement("h1", null, "Prizes"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, totalLabel, " total across two prize pools"))), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      padding: 20,
      marginBottom: 18,
      background: 'linear-gradient(135deg, #050A30 0%, #0157FF 100%)',
      color: '#fff',
      border: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '0.12em',
      fontWeight: 700,
      opacity: 0.7,
      marginBottom: 6
    }
  }, "TOTAL PRIZE POOL"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 44,
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: '-0.02em'
    }
  }, totalLabel), /*#__PURE__*/React.createElement("div", {
    className: "pool-split"
  }, PRIZE_POOLS.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    className: "pool-split-item"
  }, /*#__PURE__*/React.createElement("div", {
    className: "pool-split-amt"
  }, p.poolLabel), /*#__PURE__*/React.createElement("div", {
    className: "pool-split-lbl"
  }, p.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      opacity: 0.78,
      marginTop: 14,
      lineHeight: 1.5
    }
  }, "Tiebreakers settled by combined accuracy on Total Tournament Goals + Cards.")), PRIZE_POOLS.map(pool => /*#__PURE__*/React.createElement("div", {
    key: pool.id,
    className: "prize-pool-block"
  }, /*#__PURE__*/React.createElement("div", {
    className: "prize-pool-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, pool.label), /*#__PURE__*/React.createElement("p", null, pool.description)), /*#__PURE__*/React.createElement("div", {
    className: "prize-pool-amt"
  }, pool.poolLabel)), pool.tiers.map((p, i) => {
    const medal = ['s1', 's2', 's3'][i] || 's4';
    return /*#__PURE__*/React.createElement("div", {
      className: "prize",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: `prize-medal ${medal}`
    }, i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", null, p.rank), /*#__PURE__*/React.createElement("div", {
      className: "desc"
    }, p.desc)), /*#__PURE__*/React.createElement("div", {
      className: "val"
    }, p.val));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 14,
      background: 'var(--responsible-beige)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "info",
    size: 18
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--gdc-gray-800)',
      lineHeight: 1.55
    }
  }, "Prizes paid in cash following KYC verification. Entry open globally; prize fulfilment subject to local geo eligibility & T&Cs. 18+ \xB7", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--gdc-red-600)',
      textDecoration: 'underline'
    }
  }, " BeGambleAware.org"), " \xB7", /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      color: 'var(--gdc-red-600)',
      textDecoration: 'underline'
    }
  }, " Full T&Cs"))))));
};

// =================== SIGN UP ===================
const SignupScreen = ({
  onDone
}) => /*#__PURE__*/React.createElement("div", {
  className: "signup-screen"
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28
  }
}, /*#__PURE__*/React.createElement("div", {
  className: "brand-mark"
}, "G"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: '0.04em'
  }
}, "WORLD CUP PREDICTOR")), /*#__PURE__*/React.createElement("h1", {
  style: {
    color: '#fff',
    fontSize: 26,
    lineHeight: 1.15,
    margin: '0 0 8px',
    letterSpacing: '-0.01em'
  }
}, "Free to play.", /*#__PURE__*/React.createElement("br", null), "Real prizes."), /*#__PURE__*/React.createElement("p", {
  style: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 14,
    margin: '0 0 24px',
    maxWidth: 320
  }
}, "Predict every score \xB7 win a share of the \xA310,000 prize pool \xB7 top prize \xA35,000."), /*#__PURE__*/React.createElement("div", {
  className: "field"
}, /*#__PURE__*/React.createElement("label", null, "Email"), /*#__PURE__*/React.createElement("input", {
  placeholder: "you@gambling.com",
  defaultValue: "ali.smith@example.com"
})), /*#__PURE__*/React.createElement("div", {
  className: "field"
}, /*#__PURE__*/React.createElement("label", null, "Username (public)"), /*#__PURE__*/React.createElement("input", {
  placeholder: "Choose a display name",
  defaultValue: "StrikerAli"
})), /*#__PURE__*/React.createElement("div", {
  className: "field"
}, /*#__PURE__*/React.createElement("label", null, "Country"), /*#__PURE__*/React.createElement("select", {
  defaultValue: "UK"
}, /*#__PURE__*/React.createElement("option", {
  value: "UK"
}, "United Kingdom"), /*#__PURE__*/React.createElement("option", {
  value: "US"
}, "United States"), /*#__PURE__*/React.createElement("option", {
  value: "CA"
}, "Canada"), /*#__PURE__*/React.createElement("option", {
  value: "IE"
}, "Ireland"))), /*#__PURE__*/React.createElement("button", {
  className: "btn btn-block",
  onClick: () => {
    window.dispatchEvent(new CustomEvent('wcp:toast', {
      detail: 'Welcome — account created'
    }));
    onDone();
  },
  style: {
    marginTop: 8
  }
}, "Create account & play"), /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)'
  }
}, "Already have one? ", /*#__PURE__*/React.createElement("a", {
  href: "#",
  style: {
    color: '#fff',
    textDecoration: 'underline'
  }
}, "Log in")), /*#__PURE__*/React.createElement("div", {
  className: "legal"
}, "18+ \xB7 UK residents only \xB7 Free to play, no purchase necessary \xB7 Prizes awarded as free-bet credits via partner sportsbook \xB7", /*#__PURE__*/React.createElement("a", {
  href: "#"
}, " Be Gamble Aware"), " \xB7 ", /*#__PURE__*/React.createElement("a", {
  href: "#"
}, "Full T&Cs")));

// =================== HOW IT WORKS ===================
const HowItWorksScreen = ({
  onBack
}) => /*#__PURE__*/React.createElement("div", {
  className: "screen"
}, /*#__PURE__*/React.createElement("div", {
  className: "screen-header"
}, /*#__PURE__*/React.createElement("button", {
  className: "icon-btn",
  onClick: onBack,
  style: {
    background: 'var(--gdc-gray-100)',
    color: 'var(--gdc-gray-900)'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "chevronL",
  size: 16
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    marginLeft: 12
  }
}, /*#__PURE__*/React.createElement("h1", null, "How it works"), /*#__PURE__*/React.createElement("div", {
  className: "sub"
}, "4 steps to climb the table"))), /*#__PURE__*/React.createElement("div", {
  className: "screen-section"
}, /*#__PURE__*/React.createElement("div", {
  className: "card"
}, /*#__PURE__*/React.createElement("div", {
  className: "steps"
}, /*#__PURE__*/React.createElement("div", {
  className: "step"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "1"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Sign up \u2014 free"), /*#__PURE__*/React.createElement("p", null, "Create your handle and pick your country. No purchase necessary, no operator deposit required to play."))), /*#__PURE__*/React.createElement("div", {
  className: "step"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "2"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Predict every match"), /*#__PURE__*/React.createElement("p", null, "Lock in a score for each fixture before kick-off \u2014 group stage through to the final."))), /*#__PURE__*/React.createElement("div", {
  className: "step"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "3"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Earn points"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("b", null, "3 pts"), " for the exact score, ", /*#__PURE__*/React.createElement("b", null, "1 pt"), " for the correct W/D/L outcome. Outrights \u2014 Winner 10 pts \xB7 2nd 5 \xB7 3rd 3 \xB7 Golden Boot 10. Tiebreaker: combined closeness to total tournament goals + cards."))), /*#__PURE__*/React.createElement("div", {
  className: "step"
}, /*#__PURE__*/React.createElement("div", {
  className: "num"
}, "4"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h4", null, "Win prizes"), /*#__PURE__*/React.createElement("p", null, "\xA310,000 in cash across two leaderboards: \xA38,000 for the top three on the main board, plus a separate \xA32,000 pool for points earned in the knockout stage. Full breakdown in the Prizes tab.")))))));
window.Screens = {
  TopBar,
  SubNav,
  AppHeader,
  BottomNav,
  HomeScreen,
  PredictScreen,
  BracketScreen,
  LeaguesScreen,
  ProfileScreen,
  PrizesScreen,
  SignupScreen,
  HowItWorksScreen
};
