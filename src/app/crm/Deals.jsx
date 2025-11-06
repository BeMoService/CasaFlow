// src/app/crm/Deals.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Deals
 * Werkt met crmStore.js (DEALS_* actions).
 * - Quick add (title/value/stage/contactId)
 * - Inline stage switch
 */
export default function DealsPage() {
  const { state, addDeal, updateDeal } = useCrm();
  const { items, loading } = state.deals;

  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.trim().toLowerCase();
    return items.filter(d =>
      d.title.toLowerCase().includes(s) ||
      String(d.value).includes(s) ||
      (d.stage || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  function submitNew(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const deal = {
      id: "D-" + Math.floor(Math.random() * 9000 + 1000),
      title: f.get("title"),
      value: Number(f.get("value") || 0),
      stage: f.get("stage") || "New",
      contactId: f.get("contactId") || "",
    };
    addDeal(deal);
    setCreating(false);
  }

  function changeStage(id, stage) {
    updateDeal(id, { stage });
  }

  if (loading) {
    return <div className="glass" style={{ padding: 16, borderRadius: 12 }}>Loading deals…</div>;
  }

  if (!loading && items.length === 0) {
    return (
      <div className="empty" style={{ textAlign: "center", padding: 24 }}>
        <h3 style={{ margin: 0 }}>No deals yet</h3>
        <p style={{ opacity: .8 }}>Create your first deal to track progress.</p>
        <button className="btn" onClick={() => setCreating(true)} style={{ marginTop: 8 }}>New Deal</button>
        {creating && <NewDealModal onClose={()=>setCreating(false)} onSubmit={submitNew} />}
      </div>
    );
  }

  return (
    <div className="card glass" style={{ padding: 12, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setCreating(true)}>New Deal</button>
        </div>
        <div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={inp}/>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={th}>Title</th>
              <th style={th}>Stage</th>
              <th style={th}>Value</th>
              <th style={th}>Contact</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <td style={td}>{d.title}</td>
                <td style={td}>
                  <select value={d.stage || "New"} onChange={(e)=>changeStage(d.id, e.target.value)}>
                    {["New","Qualified","Proposal","Negotiation","Won","Lost"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={td}>€{Number(d.value || 0).toLocaleString("nl-NL")}</td>
                <td style={td}>{d.contactId || "—"}</td>
                <td style={td}><span className="muted" style={{ opacity: .6 }}>⋯</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <NewDealModal onClose={()=>setCreating(false)} onSubmit={submitNew} />}
    </div>
  );
}

function NewDealModal({ onClose, onSubmit }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>New Deal</h3>
        <label style={lab}>Title<input name="title" required style={inp} /></label>
        <label style={lab}>Value (€)<input name="value" type="number" min="0" style={inp} /></label>
        <label style={lab}>
          Stage
          <select name="stage" style={inp} defaultValue="New">
            {["New","Qualified","Proposal","Negotiation","Won","Lost"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={lab}>Contact ID<input name="contactId" placeholder="C-001" style={inp} /></label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn">Create</button>
        </div>
      </form>
    </div>
  );
}

const th = { padding: "10px 8px", fontWeight: 600, opacity: .9, fontSize: 13 };
const td = { padding: "10px 8px", fontSize: 14 };
const inp = { padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", color: "inherit" };
const lab = { display: "grid", gap: 6, margin: "10px 0" };
const modalWrap = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", zIndex: 40 };
const modalCard = { width: "min(520px, 92vw)", background: "rgba(18,18,18,.92)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: 16 };
