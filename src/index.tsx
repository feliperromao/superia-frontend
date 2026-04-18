import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import './index.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import reportWebVitals from './reportWebVitals';
import Dashboard from './pages/dashboard';
import Agents from './pages/agents';
import Llms from './pages/llms';
import SignIn from './pages/sign-in';
import { AuthProvider, ProtectedRoute, PublicOnlyRoute } from './auth';
import { WorkspaceProvider } from './workspaces';
import Signup from './pages/signup';
import ConfirmEmail from './pages/confirm-email';

function ProtectedApp() {
  return (
    <ProtectedRoute>
      <WorkspaceProvider>
        <Outlet />
      </WorkspaceProvider>
    </ProtectedRoute>
  );
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedApp />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/llms" element={<Llms />} />
          </Route>
          <Route
            path="/login"
            element={(
              <PublicOnlyRoute>
                <SignIn />
              </PublicOnlyRoute>
            )}
          />
          <Route
            path="/signup"
            element={(
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            )}
          />
          <Route
            path="/confirm-email"
            element={<ConfirmEmail />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
