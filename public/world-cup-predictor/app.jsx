// World Cup Predictor — App shell
// Use React.* directly — every other script in this prototype already
// destructures useState/useEffect at top level, and across plain script
// tags those bindings would collide with a SyntaxError.

function App() {
  const [active, setActive] = React.useState('home');
  const [overlay, setOverlay] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    const onToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 2200);
    };
    window.addEventListener('wcp:toast', onToast);
    return () => window.removeEventListener('wcp:toast', onToast);
  }, []);

  const screens = window.Screens;

  const goTo = (id) => {
    if (id === 'prizes' || id === 'how') {
      setOverlay(id);
    } else if (id === 'outrights') {
      setOverlay(null);
      setActive('outrights');
    } else {
      setOverlay(null);
      setActive(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActive = () => {
    if (active === 'home') return <screens.HomeScreen setActive={goTo}/>;
    if (active === 'predict') return <screens.PredictScreen/>;
    if (active === 'bracket') return <screens.BracketScreen/>;
    if (active === 'outrights') return <window.OutrightsScreen/>;
    if (active === 'leagues') return <screens.LeaguesScreen/>;
    if (active === 'profile') return <screens.ProfileScreen openPrizes={() => setOverlay('prizes')}/>;
    return null;
  };

  if (overlay === 'signup') {
    return (
      <div className="app-shell">
        <screens.SignupScreen onDone={() => setOverlay(null)}/>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <screens.SubNav active={overlay || active} setActive={goTo}/>
      <div className="app-body">
        {overlay === 'prizes' ? <screens.PrizesScreen onBack={() => setOverlay(null)}/>
          : overlay === 'how' ? <screens.HowItWorksScreen onBack={() => setOverlay(null)}/>
          : renderActive()}
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="check">✓</span>{toast}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
