import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// The admin console lives at /admin and loads separately from the main app
const AdminConsole = lazy(() => import('./admin/AdminConsole.tsx'));
const isAdmin = window.location.pathname.replace(/\/+$/, '') === '/admin';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={null}>
        <AdminConsole />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
