// src/app/state/crmStore.js
// JS-only (geen JSX) zodat Vite/React het veilig als .js kan parsen.
// We gebruiken React.createElement voor de Provider-render.

import React, { createContext, useContext, useMemo, useReducer } from "react";

const CrmContext = createContext();

const initial = {
  leads:    { items: [], loading: false, error: null },
  contacts: { items: [], loading: false, error: null },
  deals:    { items: [], loading: false, error: null },
  inbox:    { items: [], loading: false, error: null },
  tasks:    { items: [], loading: false, error: null },
  counts:   { leads: 0, contacts: 0, deals: 0, inbox: 0, tasks: 0 },
};

function computeCounts(state) {
  return {
    leads: state.leads.items.length,
    contacts: state.contacts.items.length,
    deals: state.deals.items.length,
    inbox: state.inbox.items.filter((m) => m.status !== "Closed").length,
    tasks: state.tasks.items.filter((t) => t.status !== "done").length,
  };
}

function reducer(state, action) {
  switch (action.type) {
    // ===== LEADS =====
    case "LEADS_LOADING":
      return { ...state, leads: { ...state.leads, loading: true, error: null } };
    case "LEADS_SET": {
      const next = { ...state, leads: { items: action.items, loading: false, error: null } };
      return { ...next, counts: computeCounts(next) };
    }
    case "LEADS_ADD": {
      const items = [action.item, ...state.leads.items];
      const next = { ...state, leads: { ...state.leads, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "LEADS_UPDATE": {
      const items = state.leads.items.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l));
      const next = { ...state, leads: { ...state.leads, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "LEADS_REMOVE_BULK": {
      const set = new Set(action.ids);
      const items = state.leads.items.filter((l) => !set.has(l.id));
      const next = { ...state, leads: { ...state.leads, items } };
      return { ...next, counts: computeCounts(next) };
    }

    // ===== CONTACTS =====
    case "CONTACTS_LOADING":
      return { ...state, contacts: { ...state.contacts, loading: true, error: null } };
    case "CONTACTS_SET": {
      const next = { ...state, contacts: { items: action.items, loading: false, error: null } };
      return { ...next, counts: computeCounts(next) };
    }
    case "CONTACTS_ADD": {
      const items = [action.item, ...state.contacts.items];
      const next = { ...state, contacts: { ...state.contacts, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "CONTACTS_UPDATE": {
      const items = state.contacts.items.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c));
      const next = { ...state, contacts: { ...state.contacts, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "CONTACTS_REMOVE_BULK": {
      const set = new Set(action.ids);
      const items = state.contacts.items.filter((c) => !set.has(c.id));
      const next = { ...state, contacts: { ...state.contacts, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "CONTACTS_MERGE": {
      const [keep, ...others] = action.ids;
      const set = new Set(action.ids);
      let base = state.contacts.items.find((c) => c.id === keep) || {};
      const merged = state.contacts.items
        .filter((c) => set.has(c.id))
        .reduce(
          (acc, c) => ({
            ...acc,
            company: acc.company || c.company,
            email: acc.email || c.email,
            lastActivity: acc.lastActivity || c.lastActivity,
            tags: Array.from(new Set([...(acc.tags || []), ...(c.tags || [])])),
            notes: (acc.notes || "") + (c.notes ? `\n${c.notes}` : ""),
          }),
          base
        );
      const items = state.contacts.items.filter((c) => !set.has(c.id)).concat([{ ...merged, id: keep }]);
      const next = { ...state, contacts: { ...state.contacts, items } };
      return { ...next, counts: computeCounts(next) };
    }

    // ===== DEALS =====
    case "DEALS_LOADING":
      return { ...state, deals: { ...state.deals, loading: true, error: null } };
    case "DEALS_SET": {
      const next = { ...state, deals: { items: action.items, loading: false, error: null } };
      return { ...next, counts: computeCounts(next) };
    }
    case "DEALS_ADD": {
      const items = [action.item, ...state.deals.items];
      const next = { ...state, deals: { ...state.deals, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "DEALS_UPDATE": {
      const items = state.deals.items.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d));
      const next = { ...state, deals: { ...state.deals, items } };
      return { ...next, counts: computeCounts(next) };
    }

    // ===== INBOX =====
    case "INBOX_LOADING":
      return { ...state, inbox: { ...state.inbox, loading: true, error: null } };
    case "INBOX_SET": {
      const next = { ...state, inbox: { items: action.items, loading: false, error: null } };
      return { ...next, counts: computeCounts(next) };
    }
    case "INBOX_ADD": {
      const items = [action.item, ...state.inbox.items];
      const next = { ...state, inbox: { ...state.inbox, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "INBOX_UPDATE": {
      const items = state.inbox.items.map((m) => (m.id === action.id ? { ...m, ...action.patch } : m));
      const next = { ...state, inbox: { ...state.inbox, items } };
      return { ...next, counts: computeCounts(next) };
    }

    // ===== TASKS =====
    case "TASKS_LOADING":
      return { ...state, tasks: { ...state.tasks, loading: true, error: null } };
    case "TASKS_SET": {
      const next = { ...state, tasks: { items: action.items, loading: false, error: null } };
      return { ...next, counts: computeCounts(next) };
    }
    case "TASKS_ADD": {
      const items = [action.item, ...state.tasks.items];
      const next = { ...state, tasks: { ...state.tasks, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "TASKS_UPDATE": {
      const items = state.tasks.items.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
      const next = { ...state, tasks: { ...state.tasks, items } };
      return { ...next, counts: computeCounts(next) };
    }
    case "TASKS_REMOVE_BULK": {
      const set = new Set(action.ids);
      const items = state.tasks.items.filter((t) => !set.has(t.id));
      const next = { ...state, tasks: { ...state.tasks, items } };
      return { ...next, counts: computeCounts(next) };
    }

    default:
      return state;
  }
}

export function CrmProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Bootstrap mock data
  useMemo(() => {
    // Leads
    dispatch({ type: "LEADS_LOADING" });
    const mockLeads = [
      { id: "L-001", name: "Anna Rivera", source: "Website",   stage: "New",       value: 1200, owner: "You", updated: "Today" },
      { id: "L-002", name: "Marco Rossi", source: "LinkedIn",  stage: "Qualified", value: 4200, owner: "You", updated: "Yesterday" },
    ];
    setTimeout(() => dispatch({ type: "LEADS_SET", items: mockLeads }), 300);

    // Contacts
    dispatch({ type: "CONTACTS_LOADING" });
    const mockContacts = [
      { id: "C-001", name: "Anna Rivera",  company: "Rivera Studio", email: "anna@rivera.studio",  lastActivity: "Today",  tags: ["lead"], notes: "Requested pricing." },
      { id: "C-002", name: "Marco Rossi",  company: "Rossi Media",   email: "marco@rossi.media",   lastActivity: "2 days", tags: ["warm"], notes: "Interested in Nexora demo." },
    ];
    setTimeout(() => dispatch({ type: "CONTACTS_SET", items: mockContacts }), 350);

    // Deals
    dispatch({ type: "DEALS_LOADING" });
    const mockDeals = [
      { id: "D-001", title: "Staging – Amsterdam Zuid", value: 2400, stage: "Proposal", contactId: "C-001" },
      { id: "D-002", title: "AI-Visuals – Rome Centro", value: 5200, stage: "Negotiation", contactId: "C-002" },
    ];
    setTimeout(() => dispatch({ type: "DEALS_SET", items: mockDeals }), 400);

    // Inbox
    dispatch({ type: "INBOX_LOADING" });
    const mockInbox = [
      { id: "M-001", subject: "Pricing request", status: "Open", assignedTo: "You", unread: true },
      { id: "M-002", subject: "POC contract",   status: "Pending", assignedTo: "You", unread: false },
      { id: "M-003", subject: "Old thread",     status: "Closed", assignedTo: "Ops", unread: false },
    ];
    setTimeout(() => dispatch({ type: "INBOX_SET", items: mockInbox }), 450);

    // Tasks
    dispatch({ type: "TASKS_LOADING" });
    const mockTasks = [
      { id: "T-001", title: "Call Ruben re: pilot scope", assignee: "You", due: "Today",    status: "open" },
      { id: "T-002", title: "Prepare demo visuals pack",  assignee: "You", due: "Tomorrow", status: "open" },
    ];
    setTimeout(() => dispatch({ type: "TASKS_SET", items: mockTasks }), 500);
  }, []);

  const api = useMemo(
    () => ({
      state,

      // leads
      addLead: (item) => dispatch({ type: "LEADS_ADD", item }),
      updateLead: (id, patch) => dispatch({ type: "LEADS_UPDATE", id, patch }),
      removeLeads: (ids) => dispatch({ type: "LEADS_REMOVE_BULK", ids }),

      // contacts
      addContact: (item) => dispatch({ type: "CONTACTS_ADD", item }),
      updateContact: (id, patch) => dispatch({ type: "CONTACTS_UPDATE", id, patch }),
      removeContacts: (ids) => dispatch({ type: "CONTACTS_REMOVE_BULK", ids }),
      mergeContacts: (ids) => dispatch({ type: "CONTACTS_MERGE", ids }),

      // deals
      addDeal: (item) => dispatch({ type: "DEALS_ADD", item }),
      updateDeal: (id, patch) => dispatch({ type: "DEALS_UPDATE", id, patch }),

      // inbox
      addInboxDraft: (item) => dispatch({ type: "INBOX_ADD", item }),
      updateInbox: (id, patch) => dispatch({ type: "INBOX_UPDATE", id, patch }),

      // tasks
      addTask: (item) => dispatch({ type: "TASKS_ADD", item }),
      updateTask: (id, patch) => dispatch({ type: "TASKS_UPDATE", id, patch }),
      removeTasks: (ids) => dispatch({ type: "TASKS_REMOVE_BULK", ids }),
    }),
    [state]
  );

  // Provider zonder JSX:
  return React.createElement(CrmContext.Provider, { value: api }, children);
}

// Hook
export const useCrm = () => useContext(CrmContext);
