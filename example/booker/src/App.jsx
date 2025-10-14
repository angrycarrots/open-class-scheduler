import React, { useState } from 'react';
import { OpenClassScheduler } from '../../../dist/open-class-scheduler.es';
import '../../../dist/open-class-scheduler.css';
import './App.css';

function App() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="app">
      <button
        type="button"
        className="openButton"
        onClick={() => setModalOpen(true)}
      >
        Open
      </button>
      {modalOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalContent">
            <button
              type="button"
              className="closeButton"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
            <OpenClassScheduler />
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
