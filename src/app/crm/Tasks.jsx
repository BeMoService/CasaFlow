// src/app/crm/Tasks.jsx
import React, { useMemo, useState } from "react";
import { useCrm } from "../state/crmStore.js";

/**
 * CasaFlow CRM — Tasks
 * Werkt met crmStore.js (TASKS_* actions).
 * - Quick add
 * - Complete (status -> done) / reopen
 * - Bulk delete
 */
export default function TasksPage() {
  const { state, addTask, updateTask, removeTasks } = useCrm();
  const { items, loading } = state.tasks;

  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("open");

  const filtered = useMemo(() => {
    let base = items;
    if (filter === "open") base = items.filter(t => t.status !== "done");
    if (filter === "done") base = items.filter(t => t.status === "done");
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      base = base.filter(t =>
        t.title.toLowerCase().includes(s) ||
        (t.assignee || "").toLowerCase().includes(s)
      );
    }
    return base;
  }, [items, q, filter]);

  const allSelected = useMemo(() => filtered.length > 0 && selected.size === filtered.length, [filtered, selected]);

  function toggle(id) {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  }

  function complete(id) {
    updateTask(id, { status: "done" });
  }
  function reopen(id) {
    updateTask(id, { status: "open" });
  }
  function submitNew(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addTask({
      id: "T-" + Math.floor(Math.random() * 9000 + 1000),
      title: f.get("title"),
      assignee: f.get("assignee") || "You",
      due: f.get("due") || "Soon",
      status: "open",
    });
    setCreating(false);
  }
  function bulkDelete() {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} task(s)?`)) return;
    removeTasks([...selected]);
    setSelected(new Set());
  }

  if (loading) {
    return <div className="glass" style={{ padding: 16, borderRadius: 12 }}>Loading tasks…</div>;
  }

  if (!loading && items.length === 0) {
    return (
      <div className="empty" style={{ textAlign: "center", padding: 24 }}>
        <h3 style={{ margin: 0 }}>No tasks yet</h3>
        <p style={{ opacity: .8 }}>Create your first task to get started.</p>
        <button className="btn" onClick={() => setCreating(true)} style={{ marginTop: 8 }}>New Task</button>
        {creating && <NewTaskModal onClose={()=>setCreating(false)} onSubmit={submitNew} />}
      </div>
    );
  }

  return (
    <div className="card glass" style={{ padding: 12, borderRadius: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setCreating(true)}>New Task</button>
          <button className="btn" onClick={bulkDelete} disabled={selected.size===0} style={{ borderColor: "rgba(255,80,80,.4)" }}>Delete</button>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={inp}>
            {["open","done","all"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…" style={inp}/>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              <th style={th}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={()=>{
                    if (allSelected) setSelected(new Set());
                    else setSelected(new Set(filtered.map(i=>i.id)));
                  }}
                />
              </th>
              <th style={th}>Title</th>
              <th style={th}>Assignee</th>
              <th style={th}>Due</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <td style={td}><input type="checkbox" checked={selected.has(t.id)} onChange={()=>toggle(t.id)} /></td>
                <td style={td}>{t.title}</td>
                <td style={td}>{t.assignee || "—"}</td>
                <td style={td}>{t.due || "—"}</td>
                <td style={td}>{t.status === "done" ? "Done" : "Open"}</td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {t.status !== "done" ? (
                      <button className="btn" onClick={()=>complete(t.id)}>Complete</button>
                    ) : (
                      <button className="btn" onClick={()=>reopen(t.id)}>Reopen</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <NewTaskModal onClose={()=>setCreating(false)} onSubmit={submitNew} />}
    </div>
  );
}

function NewTaskModal({ onClose, onSubmit }) {
  return (
    <div style={modalWrap}>
      <form style={modalCard} onSubmit={onSubmit}>
        <h3 style={{ marginTop: 0 }}>New Task</h3>
        <label style={lab}>Title<input name="title" required style={inp} /></label>
        <label style={lab}>
          Assignee
          <select name="assignee" style={inp} defaultValue="You">
            {["You","Ruben","Ops","Sales"].map(o=> <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label style={lab}>Due<input name="due" placeholder="Today, Tomorrow…" style={inp} /></label>
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
