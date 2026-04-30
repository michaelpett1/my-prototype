// World Cup Predictor — Outrights + Daily Acca screens

// =================== DAILY ACCA CARD (re-usable on Home + standalone) ===================
const DailyAccaCard = ({
  onCTA
}) => {
  const {
    DAILY_ACCA,
    TEAMS
  } = window.WC_DATA;
  const a = DAILY_ACCA;
  return /*#__PURE__*/React.createElement("div", {
    className: "acca-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "acca-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "acca-eyebrow"
  }, "DAILY ACCA \xB7 ", a.date.toUpperCase()), /*#__PURE__*/React.createElement("h3", {
    className: "acca-headline"
  }, "A \xA3", a.stake, " acca on yesterday's 4 results would have returned ", /*#__PURE__*/React.createElement("em", null, "\xA3", a.return.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
    className: "acca-odds"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t"
  }, "Combined odds"), /*#__PURE__*/React.createElement("div", {
    className: "v"
  }, a.totalOdds.toFixed(2)))), /*#__PURE__*/React.createElement("div", {
    className: "acca-legs"
  }, a.legs.map((leg, i) => {
    const home = TEAMS[leg.home];
    const away = TEAMS[leg.away];
    return /*#__PURE__*/React.createElement("div", {
      className: "acca-leg",
      key: i
    }, /*#__PURE__*/React.createElement("div", {
      className: "acca-leg-teams"
    }, /*#__PURE__*/React.createElement("span", null, home?.flag, " ", home?.short), /*#__PURE__*/React.createElement("span", {
      className: "acca-score"
    }, leg.score), /*#__PURE__*/React.createElement("span", null, away?.short, " ", away?.flag)), /*#__PURE__*/React.createElement("div", {
      className: "acca-leg-pick"
    }, leg.selection), /*#__PURE__*/React.createElement("div", {
      className: "acca-leg-odds"
    }, leg.odds.toFixed(2)));
  })), /*#__PURE__*/React.createElement("div", {
    className: "acca-cta-row"
  }, /*#__PURE__*/React.createElement("div", {
    className: "acca-foot"
  }, a.operator.tagline), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm acca-cta",
    onClick: onCTA
  }, a.operator.cta, " \u2192")));
};

// =================== OUTRIGHTS SCREEN ===================
const OutrightsScreen = () => {
  const {
    TEAMS,
    OUTRIGHTS
  } = window.WC_DATA;
  const [picks, setPicks] = React.useState({
    winner: OUTRIGHTS.winner.teamCode,
    second: OUTRIGHTS.second.teamCode,
    third: OUTRIGHTS.third.teamCode,
    boot: OUTRIGHTS.goldenBoot?.player || 'Lionel Messi',
    goals: OUTRIGHTS.tiebreakGoals,
    cards: OUTRIGHTS.tiebreakCards
  });
  const teamCodes = Object.keys(TEAMS);
  const TeamPicker = ({
    value,
    onChange,
    exclude = [],
    label
  }) => /*#__PURE__*/React.createElement("select", {
    className: "outright-select",
    value: value || '',
    onChange: e => onChange(e.target.value)
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, "Select ", label.toLowerCase(), "\u2026"), teamCodes.filter(c => !exclude.includes(c)).map(code => /*#__PURE__*/React.createElement("option", {
    key: code,
    value: code
  }, TEAMS[code].flag, " ", TEAMS[code].name)));
  return /*#__PURE__*/React.createElement("div", {
    className: "screen"
  }, /*#__PURE__*/React.createElement("div", {
    className: "screen-header"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Tournament outrights"), /*#__PURE__*/React.createElement("div", {
    className: "sub"
  }, "Locked at first kick-off \xB7 28 pts available + tiebreaker")), /*#__PURE__*/React.createElement("span", {
    className: "tag locked",
    style: {
      height: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "lock",
    size: 11
  }), " \xA0Locked")), /*#__PURE__*/React.createElement("div", {
    className: "screen-section",
    style: {
      paddingTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-grid"
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-card primary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag blue"
  }, "10 pts"), /*#__PURE__*/React.createElement("span", {
    className: "outright-odds"
  }, "Best price ", OUTRIGHTS.winner.odds)), /*#__PURE__*/React.createElement("div", {
    className: "outright-label"
  }, "Tournament winner"), /*#__PURE__*/React.createElement("div", {
    className: "outright-pick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "big-flag"
  }, TEAMS[picks.winner]?.flag), /*#__PURE__*/React.createElement("span", {
    className: "big-team"
  }, TEAMS[picks.winner]?.name)), /*#__PURE__*/React.createElement(TeamPicker, {
    value: picks.winner,
    onChange: v => setPicks({
      ...picks,
      winner: v
    }),
    label: "Winner"
  })), /*#__PURE__*/React.createElement("div", {
    className: "outright-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "5 pts"), /*#__PURE__*/React.createElement("span", {
    className: "outright-odds"
  }, OUTRIGHTS.second.odds)), /*#__PURE__*/React.createElement("div", {
    className: "outright-label"
  }, "Runner-up"), /*#__PURE__*/React.createElement("div", {
    className: "outright-pick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "med-flag"
  }, TEAMS[picks.second]?.flag), /*#__PURE__*/React.createElement("span", {
    className: "med-team"
  }, TEAMS[picks.second]?.name)), /*#__PURE__*/React.createElement(TeamPicker, {
    value: picks.second,
    onChange: v => setPicks({
      ...picks,
      second: v
    }),
    exclude: [picks.winner],
    label: "2nd place"
  })), /*#__PURE__*/React.createElement("div", {
    className: "outright-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag"
  }, "3 pts"), /*#__PURE__*/React.createElement("span", {
    className: "outright-odds"
  }, OUTRIGHTS.third.odds)), /*#__PURE__*/React.createElement("div", {
    className: "outright-label"
  }, "Third place"), /*#__PURE__*/React.createElement("div", {
    className: "outright-pick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "med-flag"
  }, TEAMS[picks.third]?.flag), /*#__PURE__*/React.createElement("span", {
    className: "med-team"
  }, TEAMS[picks.third]?.name)), /*#__PURE__*/React.createElement(TeamPicker, {
    value: picks.third,
    onChange: v => setPicks({
      ...picks,
      third: v
    }),
    exclude: [picks.winner, picks.second],
    label: "3rd place"
  })), /*#__PURE__*/React.createElement("div", {
    className: "outright-card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "outright-meta"
  }, /*#__PURE__*/React.createElement("span", {
    className: "tag blue"
  }, "10 pts"), /*#__PURE__*/React.createElement("span", {
    className: "outright-odds"
  }, "Top scorers")), /*#__PURE__*/React.createElement("div", {
    className: "outright-label"
  }, "Golden Boot"), /*#__PURE__*/React.createElement("div", {
    className: "outright-pick"
  }, /*#__PURE__*/React.createElement("span", {
    className: "med-flag"
  }, "\u26BD"), /*#__PURE__*/React.createElement("span", {
    className: "med-team",
    style: {
      fontSize: 15
    }
  }, picks.boot)), /*#__PURE__*/React.createElement("select", {
    className: "outright-select",
    value: picks.boot,
    onChange: e => setPicks({
      ...picks,
      boot: e.target.value
    })
  }, OUTRIGHTS.topScorers.map(s => /*#__PURE__*/React.createElement("option", {
    key: s.name,
    value: s.name
  }, s.name, " (", s.team, ") ", s.odds))))), /*#__PURE__*/React.createElement("div", {
    className: "card",
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "target",
    size: 18
  }), /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 13
    }
  }, "Tiebreaker \xB7 combined accuracy")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12.5,
      color: 'var(--gdc-gray-700)',
      lineHeight: 1.5,
      margin: '0 0 14px'
    }
  }, "If you tie on points with another player, the prize goes to whoever's combined guess for total tournament goals + cards is closest to the actual numbers."), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tiebreak-input"
  }, /*#__PURE__*/React.createElement("label", null, "Total tournament goals"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: picks.goals,
    onChange: e => setPicks({
      ...picks,
      goals: +e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "Avg. last 3 World Cups: 161")), /*#__PURE__*/React.createElement("div", {
    className: "tiebreak-input"
  }, /*#__PURE__*/React.createElement("label", null, "Total tournament cards"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: picks.cards,
    onChange: e => setPicks({
      ...picks,
      cards: +e.target.value
    })
  }), /*#__PURE__*/React.createElement("div", {
    className: "hint"
  }, "Avg. last 3 World Cups: 226")))), /*#__PURE__*/React.createElement("div", {
    className: "outright-summary"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "outright-summary-l"
  }, "Your outrights"), /*#__PURE__*/React.createElement("div", {
    className: "outright-summary-v"
  }, "28 pts at stake \xB7 save before kick-off to lock them in")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "btn",
    onClick: () => {
      try {
        localStorage.setItem('wcp.outrights.v1', JSON.stringify(picks));
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('wcp:toast', {
        detail: 'Outrights saved'
      }));
    }
  }, "Save outrights"))));
};
window.OutrightsScreen = OutrightsScreen;
window.DailyAccaCard = DailyAccaCard;
