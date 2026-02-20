export default function Home() {
  const partnerLogos = [
    "FL", "TX", "CA", "NY", "OH", "GA", "WA", "CO", "AZ",
  ];

  const barHeights = [40, 55, 48, 70, 62, 80, 68, 90, 78, 95, 82, 88, 96, 85, 100];

  return (
    <main style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#101722" }}>
      {/* ── NAV ── */}
      <header style={{ backgroundColor: "#101722" }}>
        <div
          style={{
            maxWidth: "87.5rem",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#4541fe" />
              <circle cx="16" cy="16" r="8" fill="none" stroke="white" strokeWidth="2" />
              <path d="M12 16 C12 12 20 12 20 16" stroke="#fe0e83" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
              Healthy Together
            </span>
          </div>

          {/* Nav links */}
          <nav style={{ display: "flex", gap: "2rem" }}>
            {["Solutions", "Company", "Resources"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
              >
                {link}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <a
            href="#"
            style={{
              backgroundColor: "#4541fe",
              color: "white",
              fontWeight: 700,
              fontSize: "0.9rem",
              padding: "0.55em 1.25em",
              borderRadius: "0.5rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Start Now!
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        style={{ backgroundColor: "#101722", position: "relative", overflow: "hidden" }}
      >
        {/* Headline + CTA */}
        <div
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
            padding: "6rem 1.5rem 0",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "clamp(2.75rem, 6vw, 4.75rem)",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              marginBottom: "2rem",
            }}
          >
            Systems that deliver{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #fe0e83 0%, #a855f7 60%, #4541fe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              outcomes
            </span>{" "}
            for government.
          </h1>

          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              border: "1.5px solid rgba(255,255,255,0.35)",
              color: "white",
              fontWeight: 600,
              fontSize: "1rem",
              padding: "0.65em 1.75em",
              borderRadius: "9999px",
              textDecoration: "none",
            }}
          >
            Schedule a Demo
          </a>
        </div>

        {/* Gradient ribbon wave */}
        <div
          style={{
            position: "relative",
            marginTop: "3.5rem",
            height: "130px",
            pointerEvents: "none",
          }}
        >
          <svg
            viewBox="0 0 1440 130"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fe0e83" />
                <stop offset="45%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#4541fe" />
              </linearGradient>
              <linearGradient id="ribbonShadow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7b0a3d" />
                <stop offset="45%" stopColor="#4a2080" />
                <stop offset="100%" stopColor="#1e1a80" />
              </linearGradient>
            </defs>
            {/* Depth / shadow layer */}
            <path
              d="M-60 105 C180 100 380 25 720 60 C1060 95 1260 20 1500 45"
              stroke="url(#ribbonShadow)"
              strokeWidth="58"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
              transform="translate(6, 10)"
            />
            {/* Main ribbon */}
            <path
              d="M-60 105 C180 100 380 25 720 60 C1060 95 1260 20 1500 45"
              stroke="url(#ribbonGrad)"
              strokeWidth="52"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Partner logos */}
        <div style={{ backgroundColor: "#0c1019", padding: "2rem 1.5rem" }}>
          <div
            style={{
              maxWidth: "56rem",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {partnerLogos.map((code) => (
              <div
                key={code}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "9999px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                }}
                aria-label={`${code} partner`}
              >
                {code}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT SHOWCASE ── */}
      <section style={{ backgroundColor: "#101722", padding: "4rem 1.5rem 8rem" }}>
        <div style={{ maxWidth: "87.5rem", margin: "0 auto" }}>
          <div
            style={{
              background: "linear-gradient(145deg, #3d39f0 0%, #2318a8 45%, #160e6e 100%)",
              borderRadius: "1.5rem",
              padding: "2.5rem",
              overflow: "hidden",
            }}
          >
            {/* Mock dashboard UI */}
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: "0.875rem",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Browser chrome */}
              <div
                style={{
                  background: "rgba(0,0,0,0.35)",
                  padding: "0.65rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840" }} />
                <div
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 4,
                    height: 20,
                    marginLeft: "0.75rem",
                  }}
                />
              </div>

              {/* Dashboard body */}
              <div style={{ display: "flex", minHeight: 320 }}>
                {/* Sidebar */}
                <div
                  style={{
                    width: 180,
                    background: "rgba(0,0,0,0.25)",
                    padding: "1.25rem 1rem",
                    flexShrink: 0,
                  }}
                >
                  {["Dashboard", "Applications", "Residents", "Reports", "Settings"].map((item, i) => (
                    <div
                      key={item}
                      style={{
                        padding: "0.55rem 0.75rem",
                        borderRadius: "0.4rem",
                        marginBottom: "0.25rem",
                        background: i === 0 ? "rgba(69,65,254,0.4)" : "transparent",
                        color: i === 0 ? "white" : "rgba(255,255,255,0.45)",
                        fontSize: "0.8rem",
                        fontWeight: i === 0 ? 600 : 400,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: "1.25rem" }}>
                  {/* Stat cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.875rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {[
                      { label: "Applications", value: "2,847", change: "↑ 12% this week", up: true },
                      { label: "Approved", value: "1,923", change: "↑ 8% this week", up: true },
                      { label: "Avg. Processing", value: "2.3 days", change: "↓ 65% faster", up: true },
                    ].map(({ label, value, change, up }) => (
                      <div
                        key={label}
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          borderRadius: "0.75rem",
                          padding: "1rem 1.1rem",
                        }}
                      >
                        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: 6 }}>
                          {label}
                        </div>
                        <div
                          style={{
                            color: "white",
                            fontWeight: 700,
                            fontSize: "1.5rem",
                            lineHeight: 1,
                            marginBottom: 6,
                          }}
                        >
                          {value}
                        </div>
                        <div style={{ color: up ? "#33c458" : "#fe0e83", fontSize: "0.7rem" }}>
                          {change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart */}
                  <div
                    style={{
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "0.75rem",
                      padding: "1rem 1.1rem",
                    }}
                  >
                    <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.7rem", marginBottom: 12 }}>
                      Applications over time
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                      {barHeights.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: "3px 3px 0 0",
                            background: "linear-gradient(to top, #4541fe, #fe0e83)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SPEED & EFFICIENCY ── */}
      <section style={{ backgroundColor: "#ece4fe", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto" }}>
          {/* Section headline */}
          <h2
            style={{
              textAlign: "center",
              fontWeight: 700,
              fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              marginBottom: "4rem",
            }}
          >
            <span
              style={{
                background: "linear-gradient(90deg, #fe0e83 0%, #4541fe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Speed &amp; Efficiency
            </span>{" "}
            <span style={{ color: "#101722" }}>are our priority.</span>
          </h2>

          {/* Device mockup */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "4.5rem" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 580 }}>
              {/* Laptop body */}
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    background: "#1c1c2e",
                    borderRadius: "12px 12px 0 0",
                    padding: "8px 8px 0",
                    aspectRatio: "16/10",
                  }}
                >
                  <div
                    style={{
                      background: "#f4f4f6",
                      borderRadius: "6px 6px 0 0",
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    {/* App bar */}
                    <div
                      style={{
                        background: "#fe0e83",
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 10px",
                        gap: 6,
                      }}
                    >
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }}
                        />
                      ))}
                    </div>
                    {/* Layout */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1fr",
                        height: "calc(100% - 28px)",
                        gap: 0,
                      }}
                    >
                      <div style={{ background: "#4541fe", opacity: 0.9 }} />
                      <div style={{ padding: 8, display: "grid", gridTemplateRows: "1fr 1fr", gap: 6 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                          {[1, 2, 3].map((i) => (
                            <div key={i} style={{ background: "white", borderRadius: 4 }} />
                          ))}
                        </div>
                        <div style={{ background: "white", borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ background: "#1c1c2e", height: 10, borderRadius: "0 0 8px 8px" }} />
                <div
                  style={{
                    background: "#2c2c3e",
                    height: 3,
                    width: "28%",
                    margin: "0 auto",
                    borderRadius: "0 0 4px 4px",
                  }}
                />
              </div>

              {/* Phone */}
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 10,
                  width: 85,
                }}
              >
                <div
                  style={{
                    background: "#1c1c2e",
                    borderRadius: 14,
                    padding: 5,
                    aspectRatio: "9/19",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  <div
                    style={{
                      background: "#f4f4f6",
                      borderRadius: 10,
                      width: "100%",
                      height: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ background: "#4541fe", height: "22%" }} />
                    <div style={{ padding: 4, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ background: "white", borderRadius: 3, height: 14 }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 feature columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {[
              {
                heading: "Deploy faster than any other platform.",
                body: "Our platform is purpose-built to deliver government solutions in record time, with dedicated deployment partners.",
              },
              {
                heading: "Deliver the best experience for residents and workers.",
                body: "We create using our platform.",
              },
              {
                heading: "Long term, ROI positive deployments that you can grow with.",
                body: "Millions in tax savings for our partners.",
              },
            ].map(({ heading, body }) => (
              <div key={heading}>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    color: "#101722",
                    marginBottom: "0.5rem",
                    lineHeight: 1.3,
                  }}
                >
                  {heading}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#101722", opacity: 0.65, lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DARK CTA ── */}
      <section
        style={{
          backgroundColor: "#101722",
          padding: "8rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Radial glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 55% at 50% 80%, rgba(69,65,254,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "52rem",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 10,
          }}
        >
          <h2
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
              marginBottom: "1.5rem",
            }}
          >
            Ready to transform how government works?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.125rem", marginBottom: "2.5rem" }}>
            Join leading government agencies delivering faster, better outcomes for residents.
          </p>
          <a
            href="#"
            style={{
              display: "inline-flex",
              alignItems: "center",
              backgroundColor: "#4541fe",
              color: "white",
              fontWeight: 700,
              padding: "0.85em 2em",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Schedule a Demo
          </a>
        </div>
      </section>
    </main>
  );
}
