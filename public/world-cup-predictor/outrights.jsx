// World Cup Predictor — Outrights + Daily Acca screens

// =================== DAILY ACCA CARD (re-usable on Home + standalone) ===================
const DailyAccaCard = ({ onCTA }) => {
  const { DAILY_ACCA, TEAMS } = window.WC_DATA;
  const a = DAILY_ACCA;
  return (
    <div className="acca-card">
      <div className="acca-head">
        <div>
          <div className="acca-eyebrow">DAILY ACCA · {a.date.toUpperCase()}</div>
          <h3 className="acca-headline">A £{a.stake} acca on yesterday's 4 results would have returned <em>£{a.return.toFixed(2)}</em></h3>
        </div>
        <div className="acca-odds">
          <div className="t">Combined odds</div>
          <div className="v">{a.totalOdds.toFixed(2)}</div>
        </div>
      </div>
      <div className="acca-legs">
        {a.legs.map((leg, i) => {
          const home = TEAMS[leg.home];
          const away = TEAMS[leg.away];
          return (
            <div className="acca-leg" key={i}>
              <div className="acca-leg-teams">
                <span>{home?.flag} {home?.short}</span>
                <span className="acca-score">{leg.score}</span>
                <span>{away?.short} {away?.flag}</span>
              </div>
              <div className="acca-leg-pick">{leg.selection}</div>
              <div className="acca-leg-odds">{leg.odds.toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      <div className="acca-cta-row">
        <div className="acca-foot">{a.operator.tagline}</div>
        <button className="btn btn-sm acca-cta" onClick={onCTA}>{a.operator.cta} →</button>
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
