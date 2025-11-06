// src/app/crm/Leads.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Leads
 * Aangepast vanaf Nexora:
 * - mapped naar crmStore.js shape (state.leads.items, loading, actions)
 * - simpele in-file Toast (zonder externe deps)
 * - modals voor New Lead / Assign owner
 */
export default function LeadsPage() {
  const { state, addLead, updateLead, removeLeads } = useCrm();
  const { items, loading } = state.leads;

  const [selected, setSelected] = useState(new Set());
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [toast, setToast] = useState(null);

  const allSelected = useMemo(() => items.length > 0 && selected.size === items.length, [items, selected]);

  function pushToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 1200);
  }

  function toggle(id) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }

  function bulkArchive() {
    pushToast("Archiving…");
    setTimeout(() => {
      removeLeads([...selected]); // mock: remove == archive
      setSelected(new Set());
      pushToast("Done");
    }, 600);
  }
  function bulkDelete() {
    if (!confirm(`Delete ${selected.size} lead(s)?`)) return;
    pushToast("Deleting…");
    setTimeout(() => {
      removeLeads([...selected]);
      setSelected(new Set());
      pushToast("Deleted");
    }, 600);
  }
  function changeStage(id, stage) {
    pushToast("Updating stage…");
    setTimeout(() => {
      updateLead(id, { stage, updated: "Now" });
      pushToast("Done");
    }, 400);
  }
  function submitNewLead(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const item = {
      id: crypto.randomUUID ? crypto.randomUUID() : "L-" + Date.now(),
      name: form.get("name"),
      source: form.get("source") || "Manual",
      stage: "New",
      value: Number(form.get("value") || 0),
      owner: "You",
      updated: "Now",
    };
    setCreating(false);
    pushToast("Creating…");
    setTimeout(() => { addLead(item); pushToast("Done"); }, 500);
  }
  function assignOwner(id, owner) {
    setAssigning(null);
    pushToast("Assigning…");
    setTimeout(() => { updateLead(id, { owner, updated: "Now" }); pushToast("Done"); }, 400);
  }

  // Empty
  if (!loading && items.length === 0) {
    return (
      <div className="empty" style={{ textAlign: "center", padding: 24 }}>
        <h3 style={{ margin: 0 }}>No leads yet</h3>
        <p style={{ opacity: .8 }}>Add your first lead to start your pipeline.</p>
        <button onClick={() => setCreating(true)} className="btn" style={{ marginTop: 8 }}>New Lead</button>
        {creating && <NewLeadModal onClose={() => setCreating(false)} onSubmit={submitNewLead} />}
        <Toast msg={toast} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="glass" style={{ padding: 16, borderRadius: 12 }}>
        Loading leads…
        <Toast msg={toast} />
      </div>
    );
  }

  // Filled
  return (
    <div className="card glass" style={{ padding: 12, borderRadius: 12 }}>
      <div className="row between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div className="row" style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setCreating(true)}>New Lead</button>
          <button className="btn" onClick={bulkArchive} disabled={selected.size===0} title="Move to archive">Archive</button>
          <button className="btn" onClick={bulkDelete} disabled={selected.size===0} style={{ borderColor: "rgba(255,80,80,.4)" }}>Delete</button>
        </div>
        <div className="muted" style={{ opacity: .8 }}>{selected.size} selected</div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={th}> <input type="checkbox" checked={allSelected} onChange={()=>{
                if (allSelected) setSelected(new Set());
                else setSelected(new Set(items.map(i=>i.id)));
              }} /></th>
              <th style={th}>Name</th>
              <th style={th}>Source</th>
              <th style={th}>Stage</th>
              <th style={th}>Value</th>
              <th style={th}>Owner</th>
              <th style={th}>Updated</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id} style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <td style={td}><input type="checkbox" checked={selected.has(l.id)} onChange={()=>toggle(l.id)} /></td>
                <td style={td}>{l.name}</td>
                <td style={td}>{l.source}</td>
                <td style={td}>
                  <select value={l.stage || "New"} onChange={(e)=>changeStage(l.id, e.target.value)}>
                    {["New","Qualified","Proposal","Won","Lost"].map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td style={td}>€{Number(l.value || 0).toLocaleString("nl-NL")}</td>
                <td style={td}>
                  <button className="link" onClick={()=>setAssigning(l.id)} style={{ background: "none", border: "none", color: "inherit", textDecoration: "underline", cursor: "pointer" }}>
                    {l.owner || "You"}
                  </button>
                </td>
                <td style={td}>{l.updated || "—"}</td>
                <td style={td}><span className="muted" style={{ opacity: .6 }}>⋯</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <NewLeadModal onClose={()=>setCreating(false)} onSubmit={submitNewLead} />}
      {assigning && <AssignModal id={assigning} onClose={()=>setAssigning(null)} onAssign={assignOwner} />}
      <Toast msg={toast} />
    </div>
  );
}

const th = { padding: "10px 8px", fontWeight: 600, opacity: .9, fontSize: 13 };
const td = { padding: "10px 8px", fontSize: 14 };

function NewLeadModal({ onClose, onSubmit }) {
  return (
    <div className="modal" style={modalWrap}>
      <form className="modal-card" onSubmit={onSubmit} style={modalCard}>
        <h3 style={{ marginTop: 0 }}>New Lead</h3>
        <label style={lab}>Name<input name="name" required style={inp} /></label>
        <label style={lab}>Source<input name="source" placeholder="Website, LinkedIn…" style={inp} /></label>
        <label style={lab}>Estimated value (€)<input name="value" type="number" min="0" style={inp} /></label>
        <div className="row end" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn">Create</button>
        </div>
      </form>
    </div>
  );
}

function AssignModal({ id, onClose, onAssign }) {
  const [owner, setOwner] = useState("You");
  return (
    <div className="modal" style={modalWrap}>
      <div className="modal-card" style={modalCard}>
        <h3 style={{ marginTop: 0 }}>Assign owner</h3>
        <select value={owner} onChange={e=>setOwner(e.target.value)} style={inp}>
          {["You","Ruben","Ops","Sales"].map(o=> <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="row end" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={()=>onAssign(id, owner)}>Assign</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", right: 16, bottom: 16, zIndex: 50,
      background: "rgba(0,0,0,.7)", border: "1px solid rgba(255,255,255,.18)",
      padding: "8px 12px", borderRadius: 10
    }}>
      {msg}
    </div>
  );
}

const modalWrap = { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", display: "grid", placeItems: "center", zIndex: 40 };
const modalCard = { width: "min(520px, 92vw)", background: "rgba(18,18,18,.92)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 12, padding: 16 };
const lab = { display: "grid", gap: 6, margin: "10px 0" };
const inp = { padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", color: "inherit" };
