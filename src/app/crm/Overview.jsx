// src/app/crm/Overview.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useCrm } from "../state/crmStore.js";

export default function Overview() {
  const { counts } = useCrm(); // { leads, contacts, deals, inbox, tasks }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      {/* Header + status strip */}
      <section
        className="card panel-outline"
        style={{
          borderRadius: 16,
          padding: 18,
          background:
            "radial-gradient(circle at top left, rgba(248,113,113,0.22), transparent 55%) rgba(8,8,10,0.96)",
          boxShadow: "0 22px 60px rgba(0,0,0,0.9)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>CasaFlow CRM</div>
            <div style={{ fontSize: 13, opacity: 0.8 }}>Powered by Nexora</div>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "flex-end",
            }}
          >
            <NavLink to="/crm/leads" className="btn">
              Open leads
            </NavLink>
            <NavLink to="/crm/contacts" className="btn">
              Import contacts
            </NavLink>
            <NavLink
              to="/crm/deals"
              className="btn btn-primary"
              style={{ borderRadius: 999 }}
            >
              New deal
            </NavLink>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <Badge tone="ok">Operational</Badge>
          <Badge>EU-West</Badge>
          <Badge tone="info">Latency ~92 ms</Badge>

          <div
            style={{
              marginLeft: "auto",
              fontSize: 12,
              opacity: 0.8,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span>Need help?</span>
            <a
              href="#/crm/help"
              style={{
                color: "rgba(248,113,113,0.9)",
                textDecoration: "underline",
              }}
            >
              Read docs
            </a>
          </div>
        </div>
      </section>

      {/* KPI cards */}
      <section
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0,1fr))",
          gap: 12,
        }}
      >
        <KpiCard
          title="Leads (open)"
          value={fmt(counts?.leads)}
          hint="+4 this week"
        />
        <KpiCard
          title="Contacts"
          value={fmt(counts?.contacts)}
          hint="Imported"
        />
        <KpiCard
          title="Active deals"
          value={fmt(counts?.deals)}
          hint="Pipeline"
        />
        <KpiCard
          title="Inbox"
          value={fmt(counts?.inbox)}
          hint="Unseen"
        />
      </section>

      {/* Quick links */}
      <section
        className="card panel-outline"
        style={{ marginTop: 14, borderRadius: 16, padding: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>Quick links</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            CasaFlow CRM (Powered by Nexora)
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <NavLink to="/crm/leads" className="btn">
            Create lead
          </NavLink>
          <NavLink to="/crm/templates" className="btn">
            Email template
          </NavLink>
          <NavLink to="/crm/automations" className="btn">
            Automation
          </NavLink>
          <NavLink to="/crm/settings" className="btn">
            Team settings
          </NavLink>
        </div>
      </section>

      {/* Recent activity */}
      <section
        className="card panel-outline"
        style={{ marginTop: 14, borderRadius: 16, padding: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700 }}>Recent activity</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Last 24h</div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            className="table"
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead>
              <tr>
                <th style={th}>Type</th>
                <th style={th}>Title</th>
                <th style={th}>Owner</th>
                <th style={th}>When</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td style={td}>
                    <Skeleton width={80} />
                  </td>
                  <td style={td}>
                    <Skeleton width={220} />
                  </td>
                  <td style={td}>
                    <Skeleton width={120} />
                  </td>
                  <td style={td}>
                    <Skeleton width={90} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            opacity: 0.75,
          }}
        >
          Data shows once Firestore wiring is connected to the activity feed.
        </div>
      </section>

      {/* local shimmer keyframes */}
      <style>{`
        @keyframes cf-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: 0 0; }
        }

        @media (max-width: 900px) {
          .cf-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .cf-kpi-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

const th = {
  padding: "6px 8px",
  fontWeight: 600,
  opacity: 0.85,
  borderBottom: "1px solid rgba(148,163,184,0.28)",
};

const td = {
  padding: "8px 8px",
  borderBottom: "1px solid rgba(148,163,184,0.18)",
};

function KpiCard({ title, value, hint }) {
  return (
    <div
      className="card panel-outline"
      style={{
        borderRadius: 16,
        padding: 14,
        background:
          "radial-gradient(circle at top right, rgba(248,113,113,0.18), transparent 55%) rgba(8,8,10,0.96)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
        {value ?? "—"}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>{hint}</div>
    </div>
  );
}

function Badge({ children, tone }) {
  let style = {
    display: "inline-flex",
    alignItems: "center",
    height: 26,
    padding: "0 10px",
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(15,23,42,0.9)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    opacity: 0.9,
  };

  if (tone === "ok") {
    style = {
      ...style,
      borderColor: "rgba(34,197,94,0.9)",
      background: "rgba(22,101,52,0.7)",
    };
  } else if (tone === "info") {
    style = {
      ...style,
      borderColor: "rgba(59,130,246,0.9)",
      background: "rgba(30,64,175,0.7)",
    };
  }

  return <span style={style}>{children}</span>;
}

function Skeleton({ width = 120 }) {
  return (
    <div
      style={{
        width,
        height: 14,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.18) 37%, rgba(255,255,255,0.06) 63%)",
        backgroundSize: "400% 100%",
        animation: "cf-shimmer 1.4s infinite",
      }}
    />
  );
}

function fmt(n) {
  if (typeof n !== "number") return "—";
  return new Intl.NumberFormat().format(n);
}
