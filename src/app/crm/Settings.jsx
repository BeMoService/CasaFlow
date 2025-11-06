// src/app/crm/Settings.jsx
import React, { useState } from "react";

/**
 * CasaFlow CRM — Settings
 * Mock settings voor CRM configuratie / branding.
 * Later te koppelen aan Firestore user settings.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "CasaFlow Realty",
    defaultCurrency: "€",
    theme: "dark",
    notifications: true,
  });
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setSettings(s => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    // later: save to Firestore
  }

  return (
    <div className="card glass" style={{ padding: 16, borderRadius: 12, maxWidth: 600 }}>
      <h1 style={{ marginTop: 0 }}>Settings</h1>
      <form onSubmit={handleSave} style={{ display: "grid", gap: 12 }}>
        <label style={lab}>
          Company name
          <input name="companyName" value={settings.companyName} onChange={handleChange} style={inp} />
        </label>
        <label style={lab}>
          Default currency
          <input name="defaultCurrency" value={settings.defaultCurrency} onChange={handleChange} style={inp} />
        </label>
        <label style={lab}>
          Theme
          <select name="theme" value={settings.theme} onChange={handleChange} style={inp}>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>
        <label style={{ ...lab, flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleChange} />
          Enable notifications
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="btn">Save</button>
        </div>
        {saved && <div style={{ color: "#0f0", fontSize: 14 }}>Saved ✔</div>}
      </form>
    </div>
  );
}

const inp = { padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.16)", color: "inherit" };
const lab = { display: "grid", gap: 6 };
