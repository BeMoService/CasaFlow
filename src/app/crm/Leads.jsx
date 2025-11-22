// src/app/crm/Leads.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Leads
 * - Gebruikt crmStore.js shape (state.leads.items, loading, actions)
 * - Simpele in-file Toast
 * - Modals voor New Lead / Assign owner
 * - Gestyled in CasaFlow glass + rood theme
 */
export default function LeadsPage() {
  const { state, addLead, updateLead, removeLeads } = useCrm();
  const { items, loading } = state.leads;

  const [selected, setSelected] = useState(new Set());
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [toast, setToast] = useState(null);

  const allSelected = useMemo(
    () => items.length > 0 && selected.size === items.length,
    [items, selected]
  );

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
    if (selected.size === 0) return;
    pushToast("Archiving…");
    setTimeout(() => {
      removeLeads([...selected]); // mock: remove == archive
      setSelected(new Set());
      pushToast("Done");
    }, 600);
  }

  function bulkDelete() {
    if (selected.size === 0) return;
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
    setTimeout(() => {
      addLead(item);
      pushToast("Done");
    }, 500);
  }

  function assignOwner(id, owner) {
    setAssigning(null);
    pushToast("Assigning…");
    setTimeout(() => {
      updateLead(id, { owner, updated: "Now" });
      pushToast("Done");
    }, 400);
  }

  // Empty state
  if (!loading && items.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div
          className="card panel-outline"
          style={{
            textAlign: "center",
            padding: 24,
            borderRadius: 16,
            background:
              "radial-gradient(circle at top, rgba(248,113,113,0.18), transparent 55%) rgba(8,8,10,0.96)",
          }}
        >
          <h3 style={{ margin: 0 }}>No leads yet</h3>
          <p style={{ opacity: 0.8, marginTop: 6 }}>
            Add your first lead to start your pipeline.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="btn btn-primary"
            style={{ marginTop: 10, borderRadius: 999 }}
          >
            New lead
          </button>
        </div>

        {creating && (
          <NewLeadModal onClose={() => setCreating(false)} onSubmit={submitNewLead} />
        )}
        <Toast msg={toast} />
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
        <div
          className="card panel-outline"
          style={{
            padding: 16,
            borderRadius: 16,
            background:
              "radial-gradient(circle at top, rgba(248,113,113,0.14), transparent 50%) rgba(8,8,10,0.96)",
          }}
        >
          Loading leads…
        </div>
        <Toast msg={toast} />
      </div>
    );
  }

  // Filled
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div
        className="card panel-outline"
        style={{
          padding: 12,
          borderRadius: 16,
          background:
            "radial-gradient(circle at top right, rgba(248,113,113,0.16), transparent 55%) rgba(8,8,10,0.96)",
        }}
      >
        {/* Toolbar */}
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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="btn btn-primary"
              onClick={() => setCreating(true)}
              style={{ borderRadius: 999 }}
            >
              New lead
            </button>
            <button
              className="btn"
              onClick={bulkArchive}
              disabled={selected.size === 0}
              title="Move to archive"
            >
              Archive
            </button>
            <button
              className="btn"
              onClick={bulkDelete}
              disabled={selected.size === 0}
              style={{ borderColor: "rgba(248,113,113,0.6)" }}
            >
              Delete
            </button>
          </div>
          <div className="muted" style={{ opacity: 0.8, fontSize: 13 }}>
            {selected.size} selected
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", marginTop: 4 }}>
          <table
            className="table"
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}
          >
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th style={th}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => {
                      if (allSelected) setSelected(new Set());
                      else setSelected(new Set(items.map((i) => i.id)));
                    }}
                  />
                </th>
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
              {items.map((l) => (
                <tr
                  key={l.id}
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <td style={td}>
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggle(l.id)}
                    />
                  </td>
                  <td style={td}>{l.name}</td>
                  <td style={td}>{l.source}</td>
                  <td style={td}>
                    <select
                      value={l.stage || "New"}
                      onChange={(e) => changeStage(l.id, e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(148,163,184,0.6)",
                        color: "inherit",
                        fontSize: 13,
                      }}
                    >
                      {["New", "Qualified", "Proposal", "Won", "Lost"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td style={td}>
                    €{Number(l.value || 0).toLocaleString("nl-NL")}
                  </td>
                  <td style={td}>
                    <button
                      className="link"
                      onClick={() => setAssigning(l.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "inherit",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      {l.owner || "You"}
                    </button>
                  </td>
                  <td style={td}>{l.updated || "—"}</td>
                  <td style={td}>
                    <span className="muted" style={{ opacity: 0.6 }}>
                      ⋯
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {creating && (
          <NewLeadModal onClose={() => setCreating(false)} onSubmit={submitNewLead} />
        )}
        {assigning && (
          <AssignModal
            id={assigning}
            onClose={() => setAssigning(null)}
            onAssign={assignOwner}
          />
        )}
      </div>

      <Toast msg={toast} />
    </div>
  );
}

const th = {
  padding: "10px 8px",
  fontWeight: 600,
  opacity: 0.9,
  fontSize: 13,
};

const td = {
  padding: "10px 8px",
  fontSize: 14,
};

function NewLeadModal({ onClose, onSubmit }) {
  return (
    <div style={modalWrap}>
      <form className="card" onSubmit={onSubmit} style={modalCard}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>New lead</h3>
        <label style={lab}>
          Name
          <input name="name" required style={inp} />
        </label>
        <label style={lab}>
          Source
          <input
            name="source"
            placeholder="Website, LinkedIn…"
            style={inp}
          />
        </label>
        <label style={lab}>
          Estimated value (€)
          <input name="value" type="number" min="0" style={inp} />
        </label>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary">Create</button>
        </div>
      </form>
    </div>
  );
}

function AssignModal({ id, onClose, onAssign }) {
  const [owner, setOwner] = useState("You");
  return (
    <div style={modalWrap}>
      <div className="card" style={modalCard}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Assign owner</h3>
        <select
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          style={inp}
        >
          {["You", "Ruben", "Ops", "Sales"].map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 8,
          }}
        >
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onAssign(id, owner)}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 50,
        background: "rgba(0,0,0,.8)",
        border: "1px solid rgba(248,113,113,0.6)",
        padding: "8px 12px",
        borderRadius: 10,
        fontSize: 13,
      }}
    >
      {msg}
    </div>
  );
}

const modalWrap = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  backdropFilter: "blur(3px)",
  display: "grid",
  placeItems: "center",
  zIndex: 40,
};

const modalCard = {
  width: "min(520px, 92vw)",
  background: "rgba(18,18,18,.96)",
  border: "1px solid rgba(248,113,113,0.6)",
  borderRadius: 14,
  padding: 16,
};

const lab = { display: "grid", gap: 6, margin: "10px 0" };

const inp = {
  padding: "8px 10px",
  borderRadius: 8,
  background: "rgba(15,23,42,0.9)",
  border: "1px solid rgba(148,163,184,0.6)",
  color: "inherit",
};
