import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and load from persisted_defaults.json for regular visitors
import persistedDefaults from "./data/persisted_defaults.json";

try {
  if (typeof window !== "undefined") {
    const originalGetItem = window.localStorage.getItem.bind(window.localStorage);
    window.localStorage.getItem = function (key) {
      if (!key) return null;
      
      const isAdminVerified = originalGetItem("ae_admin_verified_v3") === "true";
      if (isAdminVerified) {
        return originalGetItem(key);
      }
      
      const persistedDump = (persistedDefaults?.localStorageDump as Record<string, any>);
      if (persistedDump && key in persistedDump) {
        const val = persistedDump[key];
        return typeof val === "string" ? val : JSON.stringify(val);
      }
      
      return originalGetItem(key);
    };
  }
} catch (e) {
  console.warn("localStorage override blocked:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
