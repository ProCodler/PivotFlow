import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Tailwind CSS directives and global styles

// Environment variable for canister ID (ensure this is set in .env or via Vite config)
// Vite replaces import.meta.env.VITE_ZERO_FEE_BOT_BACKEND_CANISTER_ID with the actual value at build time.
// We are also setting it as a global variable for easier access in the placeholder index.js for now
// This is not ideal for production but helps with the current stubbed setup.
// In a dfx project, canister IDs are typically injected differently.
const canisterId = import.meta.env.VITE_ZERO_FEE_BOT_BACKEND_CANISTER_ID ||
                   process.env.ZERO_FEE_BOT_BACKEND_CANISTER_ID || // for node env
                   "bkyz2-fmaaa-aaaaa-qaaaq-cai"; // Default placeholder

// Make canisterId available to the non-module script if needed (e.g. for placeholder index.js)
// @ts-ignore
window.ZERO_FEE_BOT_BACKEND_CANISTER_ID = canisterId;
// @ts-ignore
process.env.ZERO_FEE_BOT_BACKEND_CANISTER_ID = canisterId;


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
