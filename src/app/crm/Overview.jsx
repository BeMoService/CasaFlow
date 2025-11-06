// src/app/crm/Overview.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Overview
 * Aangepast vanaf Nexora UI-only mock.
 * - Quick links naar CRM secties + Upload
 * - System status
 * - KPI capsules (leads/contacts/deals/inbox/tasks)
 */
export default function Overview() {
  const { state, addLead } = useCrm();
  const { counts, leads, deals, inbox } = state;

  const latestLead = leads.items[0];
  const latestDeal = deals.items[0];
  const latestMsg  = inbox.items.find(m => m.status !== "Closed");

  return (
    <main className="l2-page">
      <header className="page-head" style={{ marginBottom: 12 }}>
        <div className="eyebrow">Overview</div>
        <h1 className="page-title" style={{ margin: 0 }}>Welcome</h1>
        <p className="page-sub" style={{ opacity: .8 }}>
          Quick glance at your CasaFlow workspace. This is a mock interface — engine is in <b>Mock mode</b>.
        </p>

        <div className="flex flex-wrap gap-8 mt-3" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <SmallLink to="/crm" label="CRM Overview" />
          <SmallLink to="/crm/leads" label="Leads" />
          <SmallLink to="/crm/deals" label="Deals" />
          <SmallLink to="/upload" label="Upload Property" />
        </div>
      </header>

      <div className="container" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 12 }}>
        {/* System status */}
        <section className="card glassy" style={{ padding: 16, borderRadius: 12 }}>
          <div className="flex" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div className="flex items-center gap-10" style={{ display: "flex", gap: 20 }}>
              <Status label="Engine" value="Mock" />
              <Status label="Queue" value="0" />
              <Status label="Auth" value="OK" />
              <Status label="Firestore" value="OK" />
              <Status label="Storage" value="OK" />
            </div>
            <div className="flex gap-2" style={{ display: "flex", gap: 8 }}>
              <button className="btn">Refresh</button>
              <button className="btn disabled" disabled title="Mock only">Start engine</button>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(5, minmax(0,1fr))" }}>
          <Kpi label="Leads" value={counts.leads} to="/crm/leads" />
          <Kpi label="Contacts" value={counts.contacts} to="/crm/contacts" />
          <Kpi label="Deals" value={counts.deals} to="/crm/deals" />
          <Kpi label="Inbox" value={counts.inbox} to="/crm/inbox" />
          <Kpi label="Tasks" value={counts.tasks} to="/crm/tasks" />
        </section>

        {/* Highlights */}
        <section className="grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1.2fr .8fr" }}>
          <div className="glass card" style={{ padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
              <button
                className="btn"
                onClick={() =>
                  addLead({
                    id: "L-" + Math.floor(Math.random()*9000+1000),
                    name: "New Pilot Lead",
                    source: "QuickAdd",
                    stage: "New",
                    value: 0,
                    owner: "You",
                    updated: "Now",
                  })
                }
              >
                Create Lead
              </button>
              <Link className="btn" to="/crm/templates">Browse Templates</Link>
              <Link className="btn" to="/crm/automations">Automations</Link>
              <Link className="btn" to="/upload">Upload Property</Link>
            </div>
          </div>

          <div className="glass card" style={{ padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>System Notes</h3>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>CRM pages use mock data from <code>crmStore.js</code>.</li>
              <li>Real engine will hook into Nexora later.</li>
              <li>All pages are mobile-responsive.</li>
            </ul>
          </div>

          <div className="glass card" style={{ padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Latest Lead</h3>
            {latestLead ? (
              <div>
                <div style={{ fontWeight: 600 }}>{latestLead.name}</div>
                <div style={{ opacity: .8, fontSize: 14 }}>Source: {latestLead.source} • Stage: {latestLead.stage || "—"}</div>
                <div style={{ marginTop: 10 }}><Link className="btn" to="/crm/leads">Open Leads</Link></div>
              </div>
            ) : (
              <Empty label="No leads yet" action="Create Lead" to="/crm/leads" />
            )}
          </div>

          <div className="glass card" style={{ padding: 16, borderRadius: 12 }}>
            <h3 style={{ marginTop: 0 }}>Recent</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <RecentItem
                title="Latest Deal"
                value={latestDeal ? `${latestDeal.title} — €${latestDeal.value}` : "No deals yet"}
                to="/crm/deals"
              />
              <RecentItem
                title="Inbox"
                value={latestMsg ? `${latestMsg.subject} — ${latestMsg.status}` : "No open messages"}
                to="/crm/inbox"
              />
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .btn { display:inline-flex; align-items:center; justify-content:center; padding:8px 12px; border-radius:10px; background:rgba(255,255,255,.06); outline:1px solid rgba(255,255,255,.08); text-decoration:none; }
        .btn.disabled { opacity:.6; cursor:not-allowed; }
        @media (max-width: 1100px) {
          .container > section:nth-child(2){ grid-template-columns: repeat(2, minmax(0,1fr)); }
          .container > section:nth-child(3){ grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .container > section:nth-child(2){ grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

function SmallLink({ to, label }) {
  return (
    <Link to={to} className="text-sm navlink-underline" style={{ paddingBottom: 2, textDecoration: "none" }}>
      {label}
    </Link>
  );
}
function Status({ label, value }) {
  return (
    <div className="flex items-center gap-2" style={{ display: "flex", gap: 8 }}>
      <span className="label" style={{ opacity: .8 }}>{label}</span>
      <span className="badge" style={{ padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(255,255,255,.18)" }}>{value}</span>
    </div>
  );
}
function Kpi({ label, value, to }) {
  return (
    <Link to={to} className="card glassy" style={{ padding: 14, borderRadius: 12, textDecoration: "none", outline: "1px solid rgba(255,255,255,.08)" }}>
      <div className="label" style={{ opacity: .8 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{value}</div>
    </Link>
  );
}
function RecentItem({ title, value, to }) {
  return (
    <Link to={to} className="glass" style={{ display: "block", padding: 12, borderRadius: 12, textDecoration: "none", outline: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontSize: 12, opacity: .75 }}>{title}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </Link>
  );
}
function Empty({ label, action, to }) {
  return (
    <div style={{ opacity: .8 }}>
      <div>{label}</div>
      {to ? <div style={{ marginTop: 8 }}><Link className="btn" to={to}>{action}</Link></div> : null}
    </div>
  );
}
