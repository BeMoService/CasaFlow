// src/components/AuthControls.jsx
import React from "react";
import { auth } from "../firebase/config";
import { signOut } from "firebase/auth";

export default function AuthControls() {
  const u = auth.currentUser;
  return (
     <div style={{ display:"inline-flex", gap:8, alignItems:"center" }}>
       <span style={{ opacity:.85, fontSize:13 }}>{u?.email || "Guest"}</span>
       {u && (
         <button
           onClick={() => signOut(auth)}
           className="btn"
           style={{ padding:"6px 10px", borderRadius:10 }}
         >
           Logout
         </button>
       )}
     </div>
  );
}
