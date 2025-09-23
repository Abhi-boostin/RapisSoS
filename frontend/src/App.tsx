import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { AppRoutes } from './routes';

function App() {
  return (
    <AppStateProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppStateProvider>
  );
}

export default App;