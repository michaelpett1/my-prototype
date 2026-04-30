// World Cup Predictor — Outrights + Daily Acca screens

// =================== DAILY ACCA CARD ==================================
// Forward-looking: builds an acca from the user's predictions for today
// (or tomorrow if there are none for today) and shows what £10 would return.
const DailyAccaCard = ({ onCTA, stake = 10 }) => {
  const { FIXTURES, TEAMS, DAILY_ACCA } = window.WC_DATA;
  const op = DAILY_ACCA.operator;

  // Re-render when picks change so the acca stays in sync with the score
  // inputs on the same page.
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const h = () => force(n => n + 1);
    window.addEventListener('wcp:picks-changed', h);
    return () => window.removeEventListener('wcp:picks-changed', h);
  }, []);

  // Pull stored picks from the same store the FixtureCard writes to.
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem('wcp.picks.v1') || '{}'); } catch (e) {}
  const pickFor = (f) => stored[f.id] || f.myPick;

  // Build leg odds from the predicted result. Bigger margins read longer.
  const legOdds = (pick) => {
    const h = parseInt(pick.h, 10);
    const a = parseInt(pick.a, 10);
    if (Number.isNaN(h) || Number.isNaN(a)) return null;
    if (h === a) return 3.40;
    const margin = Math.abs(h - a);
    const base = h > a ? 1.85 : 2.20;
    return +(base + margin * 0.30).toFixed(2);
  };
  const selectionFor = (pick, home, away) => {
    const h = parseInt(pick.h, 10);
    const a = parseInt(pick.a, 10);
    if (h === a) return 'Draw';
    return h > a ? `${home.name} win` : `${away.name} win`;
  };

  // Today's open picks first; fall back to tomorrow's; cap at 4 legs.
  const todayPicks = FIXTURES.filter(f => f.date === 'Today' && f.status === 'open' && pickFor(f));
  const tomorrowPicks = FIXTURES.filter(f => f.date === 'Tomorrow' && f.status === 'open' && pickFor(f));
  const sourceList = todayPicks.length > 0 ? todayPicks : tomorrowPicks;
  const dayLabel = todayPicks.length > 0 ? 'TODAY' : tomorrowPicks.length > 0 ? 'TOMORROW' : null;
  const legs = sourceList.slice(0, 4).map(f => {
    const pick = pickFor(f);
    const home = TEAMS[f.home];
    const away = TEAMS[f.away];
    const odds = legOdds(pick);
    if (odds == null) return null;
    return {
      home, away,
      score: `${pick.h}–${pick.a}`,
      selection: selectionFor(pick, home, away),
      odds,
    };
  }).filter(Boolean);

  // Empty state — no picks set for today or tomorrow.
  if (legs.length === 0) {
    return (
      <div className="acca-card">
        <div className="acca-head">
          <div>
            <div className="acca-eyebrow">DAILY ACCA</div>
            <h3 className="acca-headline">Make picks for today's matches and we'll show what they'd be worth as an acca with <em>{op.name}</em>.</h3>
          </div>
        </div>
        <div className="acca-cta-row">
          <div className="acca-foot">{op.tagline}</div>
        </div>
      </div>
    );
  }

  const totalOdds = legs.reduce((acc, leg) => acc * leg.odds, 1);
  const potentialReturn = stake * totalOdds;

  return (
    <div className="acca-card">
      <div className="acca-head">
        <div>
          <div className="acca-eyebrow">DAILY ACCA · {dayLabel}</div>
          <h3 className="acca-headline">A £{stake} acca on your {legs.length === 1 ? 'pick' : `${legs.length} picks`} for today could return <em>£{potentialReturn.toFixed(2)}</em></h3>
        </div>
        <div className="acca-odds">
          <div className="t">Combined odds</div>
          <div className="v">{totalOdds.toFixed(2)}</div>
        </div>
      </div>
      <div className="acca-legs">
        {legs.map((leg, i) => (
          <div className="acca-leg" key={i}>
            <div className="acca-leg-teams">
              <span>{leg.home.flag} {leg.home.short}</span>
              <span className="acca-score">{leg.score}</span>
              <span>{leg.away.short} {leg.away.flag}</span>
            </div>
            <div className="acca-leg-pick">{leg.selection}</div>
            <div className="acca-leg-odds">{leg.odds.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="acca-cta-row">
        <div className="acca-foot">{op.tagline}</div>
        <button type="button" className="btn btn-sm acca-cta" onClick={onCTA}>Place this acca with {op.name} →</button>
      </div>
    </div>
  );
};

// =================== OUTRIGHTS SCREEN ===================
const OutrightsScreen = () => {
  const { TEAMS, OUTRIGHTS } = window.WC_DATA;
  const [picks, setPicks] = React.useState({
    winner: OUTRIGHTS.winner.teamCode,
    second: OUTRIGHTS.second.teamCode,
    third: OUTRIGHTS.third.teamCode,
    boot: OUTRIGHTS.goldenBoot?.player || 'Lionel Messi',
    goals: OUTRIGHTS.tiebreakGoals,
    cards: OUTRIGHTS.tiebreakCards,
  });

  const teamCodes = Object.keys(TEAMS);
  const TeamPicker = ({ value, onChange, exclude = [], label }) => (
    <select
      className="outright-select"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
    >
      <option value="" disabled>Select {label.toLowerCase()}…</option>
      {teamCodes.filter(c => !exclude.includes(c)).map(code => (
        <option key={code} value={code}>{TEAMS[code].flag} {TEAMS[code].name}</option>
      ))}
    </select>
  );

  return (
    <div className="screen">
      <div className="screen-header">
        <div>
          <h1>Tournament outrights</h1>
          <div className="sub">Locked at first kick-off · 28 pts available + tiebreaker</div>
        </div>
        <span className="tag locked" style={{height:'fit-content'}}>
          <Icon name="lock" size={11}/> &nbsp;Locked
        </span>
      </div>

      <div className="screen-section" style={{paddingTop: 8}}>
        <div className="outright-grid">

          <div className="outright-card primary">
            <div className="outright-meta">
              <span className="tag blue">10 pts</span>
              <span className="outright-odds">Best price {OUTRIGHTS.winner.odds}</span>
            </div>
            <div className="outright-label">Tournament winner</div>
            <div className="outright-pick">
              <span className="big-flag">{TEAMS[picks.winner]?.flag}</span>
              <span className="big-team">{TEAMS[picks.winner]?.name}</span>
            </div>
            <TeamPicker value={picks.winner} onChange={v => setPicks({...picks, winner: v})} label="Winner"/>
          </div>

          <div className="outright-card">
            <div className="outright-meta">
              <span className="tag">5 pts</span>
              <span className="outright-odds">{OUTRIGHTS.second.odds}</span>
            </div>
            <div className="outright-label">Runner-up</div>
            <div className="outright-pick">
              <span className="med-flag">{TEAMS[picks.second]?.flag}</span>
              <span className="med-team">{TEAMS[picks.second]?.name}</span>
            </div>
            <TeamPicker
              value={picks.second}
              onChange={v => setPicks({...picks, second: v})}
              exclude={[picks.winner]}
              label="2nd place"
            />
          </div>

          <div className="outright-card">
            <div className="outright-meta">
              <span className="tag">3 pts</span>
              <span className="outright-odds">{OUTRIGHTS.third.odds}</span>
            </div>
            <div className="outright-label">Third place</div>
            <div className="outright-pick">
              <span className="med-flag">{TEAMS[picks.third]?.flag}</span>
              <span className="med-team">{TEAMS[picks.third]?.name}</span>
            </div>
            <TeamPicker
              value={picks.third}
              onChange={v => setPicks({...picks, third: v})}
              exclude={[picks.winner, picks.second]}
              label="3rd place"
            />
          </div>

          <div className="outright-card">
            <div className="outright-meta">
              <span className="tag blue">10 pts</span>
              <span className="outright-odds">Top scorers</span>
            </div>
            <div className="outright-label">Golden Boot</div>
            <div className="outright-pick">
              <span className="med-flag">⚽</span>
              <span className="med-team" style={{fontSize: 15}}>{picks.boot}</span>
            </div>
            <select
              className="outright-select"
              value={picks.boot}
              onChange={e => setPicks({...picks, boot: e.target.value})}
            >
              {OUTRIGHTS.topScorers.map(s => (
                <option key={s.name} value={s.name}>{s.name} ({s.team}) {s.odds}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="card" style={{marginTop: 16}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom: 12}}>
            <Icon name="target" size={18}/>
            <strong style={{fontSize: 13}}>Tiebreaker · combined accuracy</strong>
          </div>
          <p style={{fontSize: 12.5, color: 'var(--gdc-gray-700)', lineHeight: 1.5, margin: '0 0 14px'}}>
            If you tie on points with another player, the prize goes to whoever's combined guess for total tournament goals + cards is closest to the actual numbers.
          </p>
          <div className="grid-2">
            <div className="tiebreak-input">
              <label>Total tournament goals</label>
              <input
                type="number"
                value={picks.goals}
                onChange={e => setPicks({...picks, goals: +e.target.value})}
              />
              <div className="hint">Avg. last 3 World Cups: 161</div>
            </div>
            <div className="tiebreak-input">
              <label>Total tournament cards</label>
              <input
                type="number"
                value={picks.cards}
                onChange={e => setPicks({...picks, cards: +e.target.value})}
              />
              <div className="hint">Avg. last 3 World Cups: 226</div>
            </div>
          </div>
        </div>

        <div className="outright-summary">
          <div>
            <div className="outright-summary-l">Your outrights</div>
            <div className="outright-summary-v">28 pts at stake · save before kick-off to lock them in</div>
          </div>
          <button type="button" className="btn" onClick={() => {
            try { localStorage.setItem('wcp.outrights.v1', JSON.stringify(picks)); } catch (e) {}
            window.dispatchEvent(new CustomEvent('wcp:toast', { detail: 'Outrights saved' }));
          }}>Save outrights</button>
        </div>
      </div>
    </div>
  );
};

window.OutrightsScreen = OutrightsScreen;
window.DailyAccaCard = DailyAccaCard;
