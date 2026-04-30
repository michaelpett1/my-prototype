// World Cup Predictor — Screens

const { useState, useMemo, useEffect } = React;

// localStorage-backed pick store. Every FixtureCard reads/writes the same
// source of truth so picks survive navigation and reload.
const PICKS_KEY = 'wcp.picks.v1';
function loadPicks() {
  try { return JSON.parse(localStorage.getItem(PICKS_KEY) || '{}'); }
  catch (e) { return {}; }
}
function savePicks(p) {
  try { localStorage.setItem(PICKS_KEY, JSON.stringify(p)); } catch (e) {}
}
function setPick(id, h, a) {
  const all = loadPicks();
  if (h === '' && a === '') delete all[id];
  else all[id] = { h, a };
  savePicks(all);
  window.dispatchEvent(new Event('wcp:picks-changed'));
}
function getStoredPick(id) { return loadPicks()[id]; }
function usePicksVersion() {
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const h = () => force(n => n + 1);
    window.addEventListener('wcp:picks-changed', h);
    return () => window.removeEventListener('wcp:picks-changed', h);
  }, []);
}

// =================== TOP NAV (Gambling.com style) ===================
const TopBar = ({ onSignup }) => (
  <div className="gc-topbar">
    <div className="gc-topbar-inner">
      <a className="gc-brand">
        <div className="mark">G</div>
        <div className="name">Gambling<span>.com</span></div>
      </a>
      <nav className="gc-topnav">
        <a>Casino</a>
        <a>Sportsbook</a>
        <a>Poker</a>
        <a>Bingo</a>
        <a>News</a>
        <a className="active">World Cup</a>
        <a>Bonuses</a>
      </nav>
      <div className="gc-topbar-actions">
        <button className="btn btn-secondary btn-sm" onClick={onSignup}>Log in</button>
        <button className="btn btn-sm" onClick={onSignup}>Sign up</button>
      </div>
    </div>
  </div>
);

// =================== GAME SUB-NAV ===================
const SubNav = ({ active, setActive }) => {
  const items = [
    { id: 'home', label: 'Overview', icon: 'home' },
    { id: 'predict', label: 'Predictions', icon: 'target' },
    { id: 'bracket', label: 'Knockout bracket', icon: 'bracket' },
    { id: 'outrights', label: 'Outrights', icon: 'trophy' },
    { id: 'leagues', label: 'Leaderboards', icon: 'leaderboard' },
    { id: 'profile', label: 'My picks', icon: 'user' },
    { id: 'prizes', label: 'Prizes', icon: 'medal' },
    { id: 'how', label: 'How it works', icon: 'info' },
  ];
  return (
    <div className="gc-subnav">
      <div className="gc-subnav-inner">
        {items.map(it => (
          <button key={it.id} onClick={() => setActive(it.id)} className={active === it.id ? 'active' : ''}>
            <Icon name={it.icon} size={16}/>
            {it.label}
          </button>
        ))}
        <span className="spacer"/>
        <span className="points-pill">
          <Icon name="target" size={14}/>
          142 pts · #247
        </span>
      </div>
    </div>
  );
};

// (Legacy AppHeader / BottomNav stubs — left as no-ops for compatibility)
const AppHeader = () => null;
const BottomNav = () => null;

// =================== HOME / LANDING ===================
const HomeScreen = ({ setActive }) => {
  const { FIXTURES, LEADERBOARD } = window.WC_DATA;
  const live = FIXTURES.find(f => f.status === 'live');
  const upcoming = FIXTURES.filter(f => f.status === 'open' && !f.myPick).slice(0, 3);
  const me = LEADERBOARD.find(l => l.me);

  return (
    <div className="screen">
      <div className="wc-hero">
        <div className="wc-hero-grid">
          <div>
            <div className="eyebrow"><span className="dot"/>Tournament live · Matchday 1</div>
            <h1>Pick smart.<br/>Win <em>big.</em></h1>
            <p className="lede">Predict every match of the FIFA World Cup 2026. Free to play. £10,000 in prizes for the sharpest minds — courtesy of the team at Gambling.com.</p>
            <div style={{display:'flex', gap: 10, marginTop: 22, flexWrap: 'wrap'}}>
              <button className="btn" onClick={() => setActive('predict')}>Make your picks →</button>
              <button className="btn btn-secondary" style={{background:'rgba(255,255,255,0.10)', color:'#fff', borderColor:'transparent'}} onClick={() => setActive('how')}>How it works</button>
            </div>
          </div>
          <div>
            <div className="countdown">
              <div className="cd-cell"><div className="v">02</div><div className="l">Days</div></div>
              <div className="cd-cell"><div className="v">14</div><div className="l">Hrs</div></div>
              <div className="cd-cell"><div className="v">22</div><div className="l">Min</div></div>
              <div className="cd-cell"><div className="v">38</div><div className="l">Sec</div></div>
            </div>
            <div style={{fontSize: 10.5, marginTop: 10, opacity: 0.75, letterSpacing: '0.1em', textAlign:'center'}}>UNTIL NEXT FIXTURE LOCKS</div>
            <div className="stat-row">
              <div className="stat"><div className="v">142</div><div className="l">Your pts</div></div>
              <div className="stat"><div className="v">#247</div><div className="l">Global</div></div>
              <div className="stat"><div className="v">9/12</div><div className="l">Picks set</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="home-body" style={{padding: '24px'}}>
        <div className="home-grid">
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
              <h2 style={{margin:0, fontSize: 17, fontWeight: 700}}>Predictions due</h2>
              <span className="more" style={{fontSize:12, fontWeight:600, color:'var(--gdc-blue-600)', cursor:'pointer'}} onClick={() => setActive('predict')}>See all →</span>
            </div>
            {live && <FixtureCard fixture={live} compact/>}
            {upcoming.map(f => <FixtureCard key={f.id} fixture={f}/>)}
          </div>
          <div>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 12}}>
              <h2 style={{margin:0, fontSize: 17, fontWeight: 700}}>Top of the table</h2>
              <span className="more" style={{fontSize:12, fontWeight:600, color:'var(--gdc-blue-600)', cursor:'pointer'}} onClick={() => setActive('leagues')}>Full board →</span>
            </div>
            {LEADERBOARD.slice(0, 6).map(r => <LeaderRow key={r.rank} row={r}/>)}
            <LeaderRow row={me}/>

            <div style={{margin:'16px 0 0'}}>
              <DailyAccaCard/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== FIXTURE CARD ===================
const FixtureCard = ({ fixture: f, compact, onUpdate }) => {
  const { TEAMS } = window.WC_DATA;
  const home = TEAMS[f.home];
  const away = TEAMS[f.away];
  const stored = getStoredPick(f.id);
  const initial = stored || f.myPick || { h: '', a: '' };
  const [h, setH] = useState(initial.h ?? '');
  const [a, setA] = useState(initial.a ?? '');
  const writeBack = (nh, na) => {
    if (f.status === 'open') setPick(f.id, nh, na);
    onUpdate?.(f.id, nh, na);
  };

  const isLive = f.status === 'live';
  const isFinal = f.status === 'final';
  const hasPick = h !== '' && a !== '';

  return (
    <div className={`fixture ${isLive ? 'is-live' : ''} ${isFinal ? 'is-locked' : ''}`}>
      <div className="fixture-meta">
        <span className="grp">
          {isLive ? <span className="tag live"><span className="ld"/>Live</span> : null}
          {isFinal ? <span className="tag locked">Final</span> : null}
          <span style={{marginLeft: isLive || isFinal ? 8 : 0}}>Group {f.group} · MD{f.md || 1}</span>
        </span>
        <span className="kickoff">{f.kickoff} · {f.date}</span>
      </div>

      <div className="fixture-row">
        <div className="team">
          <div className="flag">{home.flag}</div>
          <div className="name">{home.name}</div>
          <div className="form">FORM · {home.form}</div>
        </div>

        {isLive ? (
          <div className="score-input" style={{flexDirection:'column', gap: 2}}>
            <div className="live-score">{f.live.h}–{f.live.a}</div>
            <div style={{fontSize: 9.5, color: 'var(--gdc-red-600)', letterSpacing: '0.1em', fontWeight: 700}}>67' 2ND HALF</div>
          </div>
        ) : isFinal ? (
          <div className="score-input">
            <div style={{fontSize: 22, fontWeight: 700, color: 'var(--gdc-gray-1000)'}}>{f.actual.h}–{f.actual.a}</div>
          </div>
        ) : (
          <div className="score-input">
            <input
              className={`score-box ${h !== '' ? 'set' : ''}`}
              value={h}
              onChange={(e) => { const v = e.target.value.replace(/\D/g,'').slice(0,2); setH(v); writeBack(v, a); }}
              inputMode="numeric"
              placeholder="–"
              aria-label={`${home.name} score`}
            />
            <span className="vs">VS</span>
            <input
              className={`score-box ${a !== '' ? 'set' : ''}`}
              value={a}
              onChange={(e) => { const v = e.target.value.replace(/\D/g,'').slice(0,2); setA(v); writeBack(h, v); }}
              inputMode="numeric"
              placeholder="–"
              aria-label={`${away.name} score`}
            />
          </div>
        )}

        <div className="team">
          <div className="flag">{away.flag}</div>
          <div className="name">{away.name}</div>
          <div className="form">FORM · {away.form}</div>
        </div>
      </div>

      {!compact && !isFinal && (
        <div className="fixture-extras">
          <span>{hasPick ? <><Icon name="check" size={12}/> &nbsp;Pick saved</> : 'Tap a box to predict'}</span>
          <span className="points">Up to <b>3 pts</b></span>
        </div>
      )}

      {isFinal && (
        <div className="result-line">
          <span className="actual">Your pick: <b>{f.myPick.h}–{f.myPick.a}</b> · Actual <b>{f.actual.h}–{f.actual.a}</b></span>
          {f.rule === 'exact' && <span className="pts win">Exact · +3 pts</span>}
          {f.rule === 'result' && <span className="pts" style={{background:'#FFF6E5', color:'#B26B00'}}>Result · +1 pt</span>}
          {f.rule === 'miss' && <span className="pts loss">Miss · 0 pts</span>}
        </div>
      )}
    </div>
  );
};

// =================== PREDICT SCREEN ===================
const PredictScreen = () => {
  const { FIXTURES } = window.WC_DATA;
  const [tab, setTab] = useState('upcoming');
  const [group, setGroup] = useState('ALL');
  usePicksVersion();

  const groupsInData = useMemo(() => {
    const seen = new Set(FIXTURES.map(f => f.group));
    return ['ALL', ...Array.from(seen).sort()];
  }, [FIXTURES]);
  const matchesGroup = (f) => group === 'ALL' || f.group === group;

  const upcoming = FIXTURES.filter(f => f.status === 'open' && matchesGroup(f));
  const live = FIXTURES.filter(f => f.status === 'live' && matchesGroup(f));
  const finals = FIXTURES.filter(f => f.status === 'final' && matchesGroup(f));

  const totalUpcoming = FIXTURES.filter(f => (f.status === 'open' || f.status === 'live')).length;
  const totalFinals = FIXTURES.filter(f => f.status === 'final').length;
  const list = tab === 'upcoming' ? [...live, ...upcoming] : finals;

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Predict</h1>
          <div className="sub">Lock in your scores before kick-off</div>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'upcoming' ? 'active' : ''} onClick={() => setTab('upcoming')}>Upcoming · {totalUpcoming}</button>
        <button className={tab === 'finals' ? 'active' : ''} onClick={() => setTab('finals')}>Results · {totalFinals}</button>
      </div>

      <div style={{padding: '12px 18px 0'}}>
        <div className="chip-row" style={{padding:0, marginBottom: 12}}>
          {groupsInData.map(g => (
            <button
              key={g}
              className={`chip ${group === g ? 'active' : ''}`}
              onClick={() => setGroup(g)}
            >
              {g === 'ALL' ? 'All groups' : g}
            </button>
          ))}
        </div>
      </div>

      <div className="screen-section" style={{paddingTop: 0}}>
        {list.length === 0 ? (
          <div className="empty">No fixtures match this filter.</div>
        ) : (
          list.map(f => <FixtureCard key={f.id} fixture={f}/>)
        )}
      </div>

      {tab === 'upcoming' && (
        <div className="sticky-cta">
          <button className="btn btn-block" onClick={() => {
            const ev = new CustomEvent('wcp:toast', { detail: 'Predictions saved' });
            window.dispatchEvent(ev);
          }}>Submit predictions</button>
          <div style={{textAlign: 'center', fontSize: 11, color: 'var(--gdc-gray-650)', marginTop: 6}}>
            Auto-saves as you type. Locks at kick-off.
          </div>
        </div>
      )}
    </div>
  );
};

// =================== BRACKET ===================
const BracketScreen = () => {
  const { TEAMS, KNOCKOUT } = window.WC_DATA;
  const order = ['R32', 'R16', 'QF', 'SF', 'F'];
  const accent = { open: 'var(--gdc-blue-600)', tbd: 'var(--gdc-gray-450)', locked: 'var(--gdc-gray-450)' };

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Knockout bracket</h1>
          <div className="sub">Rounds unlock as the previous round completes · 3 pts exact · 1 pt result</div>
        </div>
      </div>

      <div className="screen-section" style={{paddingTop: 4, paddingBottom: 4}}>
        <div className="grid-2">
          <div className="metric-card">
            <div className="l">Knockout pts so far</div>
            <div className="v blue">0</div>
            <div className="d">R32 unlocks first · predict now</div>
          </div>
          <div className="metric-card">
            <div className="l">R32 picks</div>
            <div className="v">5 / 8</div>
            <div className="d">3 fixtures still open</div>
          </div>
        </div>
      </div>

      <div className="bracket-grid">
        {order.map((key) => {
          const r = KNOCKOUT[key];
          return (
            <div className="round-col" key={key}>
              <h3>
                {r.label}
                {r.state === 'open' && <span className="tag blue" style={{marginLeft: 8}}>Open</span>}
                {r.state === 'tbd' && <span className="tag" style={{marginLeft: 8}}>Awaiting teams</span>}
                {r.state === 'locked' && <span className="tag locked" style={{marginLeft: 8}}>Locked</span>}
              </h3>
              {r.state !== 'open' && (
                <div style={{fontSize: 11.5, color: 'var(--gdc-gray-650)', margin: '-4px 0 12px', lineHeight: 1.4}}>
                  Unlocks after {r.unlockedAfter}
                </div>
              )}
              {r.matches.map((m, mi) => {
                if (r.state === 'open') {
                  const home = TEAMS[m.home];
                  const away = TEAMS[m.away];
                  const has = m.myPick;
                  return (
                    <div key={m.id} className={`bk-match ${has ? 'predicted' : ''}`}>
                      <div className="bk-meta">{m.kickoff}</div>
                      <div className={`bk-team ${has && has.h > has.a ? 'win' : ''}`}>
                        <span className="t"><span className="fl">{home.flag}</span>{home.short}</span>
                        <span className="s">{has?.h ?? '–'}</span>
                      </div>
                      <div className={`bk-team ${has && has.a > has.h ? 'win' : ''}`}>
                        <span className="t"><span className="fl">{away.flag}</span>{away.short}</span>
                        <span className="s">{has?.a ?? '–'}</span>
                      </div>
                      {!has && <div style={{padding:'8px 12px 4px', fontSize:11, color:'var(--gdc-blue-600)', fontWeight:600}}>Tap to predict →</div>}
                    </div>
                  );
                }
                return (
                  <div key={m.id} className="bk-match" style={{opacity: r.state === 'locked' ? 0.55 : 1, background: '#FAFAFA'}}>
                    <div className="bk-meta">{m.kickoff || 'TBD'}</div>
                    <div className="bk-team tbd">
                      <span className="t" style={{fontStyle: 'italic', fontSize: 12}}>{m.slot}</span>
                      <span className="s">–</span>
                    </div>
                    <div className="bk-team tbd">
                      <span className="t" style={{fontStyle: 'italic', fontSize: 12, opacity: 0.6}}>—</span>
                      <span className="s">–</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="screen-section">
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
            <Icon name="info" size={18}/>
            <strong style={{fontSize:13}}>Knockout scoring</strong>
          </div>
          <ul style={{margin:0, paddingLeft: 18, fontSize: 12.5, color: 'var(--gdc-gray-700)', lineHeight: 1.7}}>
            <li><b>3 pts</b> for the exact final score (after extra time / penalties)</li>
            <li><b>1 pt</b> if you got the winner right but not the score</li>
            <li>Drawn matches need a winner-on-penalties pick to score</li>
            <li>Each fixture locks at its own kick-off — keep editing until then</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// =================== LEADERBOARD ROW ===================
const LeaderRow = ({ row }) => {
  if (!row) return null;
  const r = row.rank;
  const cls = r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : '';
  const initial = row.name === 'You' ? 'Y' : row.name.slice(0, 2).toUpperCase();
  return (
    <div className={`lb-row ${row.me ? 'me' : ''}`}>
      <div className={`lb-rank ${cls}`}>#{r}</div>
      <div className="lb-avatar">{initial}</div>
      <div className="lb-name">
        {row.name}
        <span className="h">{row.loc}</span>
      </div>
      <div style={{textAlign:'right'}}>
        <div className="lb-pts">{row.pts}</div>
        <TrendIcon trend={row.trend}/>
      </div>
    </div>
  );
};

// =================== LEAGUES SCREEN ===================
const LeaguesScreen = () => {
  const { LEADERBOARD, LEAGUES } = window.WC_DATA;
  const [tab, setTab] = useState('global');
  const me = LEADERBOARD.find(l => l.me);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Leaderboards</h1>
          <div className="sub">Global rankings + your private leagues</div>
        </div>
        <button className="btn btn-secondary btn-sm">
          <Icon name="plus" size={14}/> Create
        </button>
      </div>

      <div className="tabs">
        <button className={tab === 'global' ? 'active' : ''} onClick={() => setTab('global')}>Global</button>
        <button className={tab === 'leagues' ? 'active' : ''} onClick={() => setTab('leagues')}>My leagues · {LEAGUES.length}</button>
        <button className={tab === 'friends' ? 'active' : ''} onClick={() => setTab('friends')}>Friends</button>
      </div>

      {tab === 'global' && (
        <>
          <div className="screen-section" style={{paddingTop: 12, paddingBottom: 6}}>
            <div className="card" style={{display:'flex', alignItems:'center', gap:12, padding:12}}>
              <div className="lb-avatar" style={{width: 40, height: 40, fontSize: 13}}>Y</div>
              <div style={{flex:1}}>
                <div style={{fontWeight: 700, fontSize: 13}}>You · 142 pts</div>
                <div style={{fontSize: 11, color: 'var(--gdc-gray-650)'}}>Move up <b style={{color:'var(--gdc-blue-600)'}}>59 pts</b> to crack the Top 100</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:10, color:'var(--gdc-gray-650)', letterSpacing:'0.06em'}}>RANK</div>
                <div style={{fontSize: 18, fontWeight: 800}}>#247</div>
              </div>
            </div>
          </div>

          <div className="screen-section" style={{paddingTop: 0}}>
            {LEADERBOARD.filter(l => !l.me).slice(0, 10).map(r => <LeaderRow key={r.rank} row={r}/>)}
            <div className="empty" style={{padding: '14px'}}>… 236 more players ahead of you</div>
            <LeaderRow row={me}/>
          </div>
        </>
      )}

      {tab === 'leagues' && (
        <div className="screen-section" style={{paddingTop: 12}}>
          {LEAGUES.map(l => (
            <div className="league-row" key={l.id}>
              <div className="league-icon">{l.icon}</div>
              <div>
                <h4>{l.name} {l.winning && <span className="tag win" style={{marginLeft:6}}>1ST</span>}</h4>
                <div className="meta">{l.members} members · MD1 active</div>
              </div>
              <div className="pos">
                <b>#{l.pos}</b>
                of {l.total}
              </div>
            </div>
          ))}
          <div style={{display:'grid', gap:8, gridTemplateColumns:'1fr 1fr', marginTop: 6}}>
            <button className="btn btn-secondary"><Icon name="plus" size={14}/> Create league</button>
            <button className="btn btn-ghost">Join with code</button>
          </div>
        </div>
      )}

      {tab === 'friends' && (
        <div className="empty">
          <div style={{fontSize: 28, marginBottom: 8}}>👥</div>
          Add friends to compare picks
          <div style={{marginTop: 12}}>
            <button className="btn">Invite friends</button>
          </div>
        </div>
      )}
    </div>
  );
};

// =================== PROFILE / MY PICKS ===================
const ProfileScreen = ({ openPrizes }) => {
  const { LEADERBOARD, FIXTURES } = window.WC_DATA;
  const me = LEADERBOARD.find(l => l.me);
  const finals = FIXTURES.filter(f => f.status === 'final');
  const correct = finals.filter(f => f.earned > 0).length;
  const accuracy = Math.round((correct / finals.length) * 100);

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Your profile</h1>
          <div className="sub">Cardiff, UK · Joined Apr 2026</div>
        </div>
        <button className="icon-btn" style={{background:'var(--gdc-gray-100)', color:'var(--gdc-gray-900)'}}>
          <Icon name="settings" size={16}/>
        </button>
      </div>

      <div className="screen-section" style={{paddingTop: 8}}>
        <div className="card" style={{padding: 18, textAlign:'center', background:'linear-gradient(180deg,#F1F6FF, #fff)'}}>
          <div className="lb-avatar" style={{width: 64, height: 64, fontSize: 22, margin: '0 auto 10px'}}>Y</div>
          <div style={{fontWeight: 800, fontSize: 18}}>You</div>
          <div style={{fontSize: 12, color:'var(--gdc-gray-650)', marginBottom: 14}}>{me.pts} pts · Rank #{me.rank}</div>
          <div className="grid-2" style={{padding:0}}>
            <div className="metric-card" style={{textAlign:'left'}}>
              <div className="l">Accuracy</div>
              <div className="v blue">{accuracy}%</div>
              <div className="d">{correct}/{finals.length} correct</div>
            </div>
            <div className="metric-card" style={{textAlign:'left'}}>
              <div className="l">Streak</div>
              <div className="v">2 🔥</div>
              <div className="d">Best: 4 wins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title">
        <h2>Recent results</h2>
        <span className="more">All →</span>
      </div>
      <div className="screen-section" style={{paddingTop: 0}}>
        {finals.map(f => <FixtureCard key={f.id} fixture={f}/>)}
      </div>

      <div className="section-title">
        <h2>Your prize tier</h2>
        <span className="more" onClick={openPrizes}>All prizes →</span>
      </div>
      <div className="screen-section" style={{paddingTop: 0}}>
        <div className="prize">
          <div className="prize-medal s4"><Icon name="gift" size={26}/></div>
          <div>
            <h3>Top 1,000 tier</h3>
            <div className="desc">Currently #247 · stay in to qualify</div>
          </div>
          <div className="val">£10</div>
        </div>
      </div>
    </div>
  );
};

// =================== PRIZES (modal-ish full screen) ===================
const PrizesScreen = ({ onBack }) => {
  const { PRIZES } = window.WC_DATA;
  return (
    <div className="screen">
      <div className="screen-header">
        <button className="icon-btn" onClick={onBack} style={{background:'var(--gdc-gray-100)', color:'var(--gdc-gray-900)'}}>
          <Icon name="chevronL" size={16}/>
        </button>
        <div style={{flex:1, marginLeft: 12}}>
          <h1>Prizes</h1>
          <div className="sub">£10,000 total prize pool · top 10 finishers</div>
        </div>
      </div>

      <div className="screen-section" style={{paddingTop: 8}}>
        <div className="card" style={{padding: 20, marginBottom: 14, background: 'linear-gradient(135deg, #050A30 0%, #0157FF 100%)', color:'#fff', border: 'none'}}>
          <div style={{fontSize: 11, letterSpacing: '0.12em', fontWeight:700, opacity: 0.7, marginBottom: 6}}>TOTAL PRIZE POOL</div>
          <div style={{fontSize: 44, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em'}}>£10,000</div>
          <div style={{fontSize: 13, opacity: 0.85, marginTop: 8}}>Shared between the top 10 finishers on the global leaderboard. Tiebreakers settled by Total Tournament Goals + Cards.</div>
        </div>

        {PRIZES.map((p, i) => {
          const medals = ['s1', 's2', 's3', 's3', 's4'];
          return (
            <div className="prize" key={i}>
              <div className={`prize-medal ${medals[i]}`}>{p.rank.split('–')[0].replace(/(\d+)\D*/, '$1')}</div>
              <div>
                <h3>{p.rank}</h3>
                <div className="desc">{p.desc}</div>
              </div>
              <div className="val">{p.val}</div>
            </div>
          );
        })}

        <div className="card" style={{marginTop: 14, background: 'var(--responsible-beige)'}}>
          <div style={{display:'flex', gap: 10, alignItems:'flex-start'}}>
            <Icon name="info" size={18}/>
            <div style={{fontSize:12, color: 'var(--gdc-gray-800)', lineHeight: 1.55}}>
              Prizes paid in cash following KYC verification. Entry open globally; prize fulfilment subject to local geo eligibility &amp; T&amp;Cs. 18+ ·
              <a href="#" style={{color: 'var(--gdc-red-600)', textDecoration: 'underline'}}> BeGambleAware.org</a> ·
              <a href="#" style={{color: 'var(--gdc-red-600)', textDecoration: 'underline'}}> Full T&amp;Cs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================== SIGN UP ===================
const SignupScreen = ({ onDone }) => (
  <div className="signup-screen">
    <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 28}}>
      <div className="brand-mark">G</div>
      <div style={{fontSize:14, fontWeight:700, letterSpacing:'0.04em'}}>WORLD CUP PREDICTOR</div>
    </div>
    <h1 style={{color:'#fff', fontSize: 26, lineHeight: 1.15, margin: '0 0 8px', letterSpacing: '-0.01em'}}>
      Free to play.<br/>Real prizes.
    </h1>
    <p style={{color:'rgba(255,255,255,0.72)', fontSize: 14, margin: '0 0 24px', maxWidth: 320}}>
      Predict every score · win a share of the £10,000 prize pool · top prize £5,000.
    </p>

    <div className="field">
      <label>Email</label>
      <input placeholder="you@gambling.com" defaultValue="ali.smith@example.com"/>
    </div>
    <div className="field">
      <label>Username (public)</label>
      <input placeholder="Choose a display name" defaultValue="StrikerAli"/>
    </div>
    <div className="field">
      <label>Country</label>
      <select defaultValue="UK">
        <option value="UK">United Kingdom</option>
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="IE">Ireland</option>
      </select>
    </div>

    <button className="btn btn-block" onClick={() => {
      window.dispatchEvent(new CustomEvent('wcp:toast', { detail: 'Welcome — account created' }));
      onDone();
    }} style={{marginTop:8}}>Create account &amp; play</button>
    <div style={{textAlign:'center', marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.6)'}}>
      Already have one? <a href="#" style={{color:'#fff', textDecoration:'underline'}}>Log in</a>
    </div>

    <div className="legal">
      18+ · UK residents only · Free to play, no purchase necessary · Prizes awarded as free-bet credits via partner sportsbook ·
      <a href="#"> Be Gamble Aware</a> · <a href="#">Full T&amp;Cs</a>
    </div>
  </div>
);

// =================== HOW IT WORKS ===================
const HowItWorksScreen = ({ onBack }) => (
  <div className="screen">
    <div className="screen-header">
      <button className="icon-btn" onClick={onBack} style={{background:'var(--gdc-gray-100)', color:'var(--gdc-gray-900)'}}>
        <Icon name="chevronL" size={16}/>
      </button>
      <div style={{flex:1, marginLeft: 12}}>
        <h1>How it works</h1>
        <div className="sub">4 steps to climb the table</div>
      </div>
    </div>

    <div className="screen-section">
      <div className="card">
        <div className="steps">
          <div className="step">
            <div className="num">1</div>
            <div>
              <h4>Sign up — free</h4>
              <p>Create your handle and pick your country. No purchase necessary, no operator deposit required to play.</p>
            </div>
          </div>
          <div className="step">
            <div className="num">2</div>
            <div>
              <h4>Predict every match</h4>
              <p>Lock in a score for each fixture before kick-off. Group stage, knockouts, final — all 64 matches.</p>
            </div>
          </div>
          <div className="step">
            <div className="num">3</div>
            <div>
              <h4>Earn points</h4>
              <p><b>3 pts</b> for the exact score, <b>1 pt</b> for the correct W/D/L outcome. Outrights — Winner 10 pts · 2nd 5 · 3rd 3 · Golden Boot 10. Tiebreaker: combined closeness to total tournament goals + cards.</p>
            </div>
          </div>
          <div className="step">
            <div className="num">4</div>
            <div>
              <h4>Win prizes</h4>
              <p>Top of the global leaderboard wins World Cup Final tickets, £500 free bets and more. Full prize tiers in the Prizes tab.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

window.Screens = {
  TopBar, SubNav, AppHeader, BottomNav, HomeScreen, PredictScreen, BracketScreen,
  LeaguesScreen, ProfileScreen, PrizesScreen, SignupScreen, HowItWorksScreen,
};
