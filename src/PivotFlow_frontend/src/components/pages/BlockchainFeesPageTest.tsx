import React, { useState } from 'react';

export const BlockchainFeesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  
  console.log('BlockchainFeesPage render - showForm:', showForm);

  const handleToggle = () => {
    console.log('Button clicked! Current state:', showForm);
    const newState = !showForm;
    console.log('Setting state to:', newState);
    setShowForm(newState);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Blockchain Fees Test
        </h1>
        <p className="text-slate-400">Debugging the form toggle issue</p>
      </div>

      <div className="bg-yellow-500/20 border border-yellow-500 rounded p-4 text-white">
        <p><strong>Debug Info:</strong></p>
        <p>showForm = {showForm.toString()}</p>
        <p>Component rendered at: {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="text-center">
        <button
          onClick={handleToggle}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-medium transition-all duration-300"
        >
          Toggle Form (Current: {showForm ? 'Shown' : 'Hidden'})
        </button>
      </div>

      <div className="space-y-4">
        {showForm ? (
          <div className="bg-green-500/20 border border-green-500 rounded p-8 text-white">
            <h2 className="text-xl font-semibold mb-4">✅ Form is Visible!</h2>
            <p>If you can see this green box, the state management is working correctly.</p>
            <button
              onClick={() => {
                console.log('Close button clicked');
                setShowForm(false);
              }}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Close Form
            </button>
          </div>
        ) : (
          <div className="bg-red-500/20 border border-red-500 rounded p-4 text-white">
            <p>❌ Form is Hidden</p>
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded p-4 text-slate-300">
        <p><strong>Expected behavior:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Click "Toggle Form" button</li>
          <li>Red box should change to green box</li>
          <li>Button text should update to show current state</li>
          <li>Console should show debugging messages</li>
        </ul>
      </div>
    </div>
  );
};
