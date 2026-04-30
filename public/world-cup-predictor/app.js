// World Cup Predictor — App shell
const {
  useState,
  useEffect
} = React;
function App() {
  const [active, setActive] = useState('home');
  const [overlay, setOverlay] = useState(null);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    const onToast = e => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 2200);
    };
    window.addEventListener('wcp:toast', onToast);
    return () => window.removeEventListener('wcp:toast', onToast);
  }, []);
  const screens = window.Screens;
  const goTo = id => {
    if (id === 'prizes' || id === 'how') {
      setOverlay(id);
    } else if (id === 'outrights') {
      setOverlay(null);
      setActive('outrights');
    } else {
      setOverlay(null);
      setActive(id);
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const renderActive = () => {
    if (active === 'home') return /*#__PURE__*/React.createElement(screens.HomeScreen, {
      setActive: goTo
    });
    if (active === 'predict') return /*#__PURE__*/React.createElement(screens.PredictScreen, null);
    if (active === 'bracket') return /*#__PURE__*/React.createElement(screens.BracketScreen, null);
    if (active === 'outrights') return /*#__PURE__*/React.createElement(window.OutrightsScreen, null);
    if (active === 'leagues') return /*#__PURE__*/React.createElement(screens.LeaguesScreen, null);
    if (active === 'profile') return /*#__PURE__*/React.createElement(screens.ProfileScreen, {
      openPrizes: () => setOverlay('prizes')
    });
    return null;
  };
  if (overlay === 'signup') {
    return /*#__PURE__*/React.createElement("div", {
      className: "app-shell"
    }, /*#__PURE__*/React.createElement(screens.SignupScreen, {
      onDone: () => setOverlay(null)
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "app-shell"
  }, /*#__PURE__*/React.createElement(screens.SubNav, {
    active: overlay || active,
    setActive: goTo
  }), /*#__PURE__*/React.createElement("div", {
    className: "app-body"
  }, overlay === 'prizes' ? /*#__PURE__*/React.createElement(screens.PrizesScreen, {
    onBack: () => setOverlay(null)
  }) : overlay === 'how' ? /*#__PURE__*/React.createElement(screens.HowItWorksScreen, {
    onBack: () => setOverlay(null)
  }) : renderActive()), toast && /*#__PURE__*/React.createElement("div", {
    className: "toast",
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "check"
  }, "\u2713"), toast));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
