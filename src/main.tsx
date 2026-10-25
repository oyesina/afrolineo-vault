import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { I18nProvider } from './i18n';

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
      <I18nProvider>
        <App />
      </I18nProvider>
    )}
  </StrictMode>,
);
