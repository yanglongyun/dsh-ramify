import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProjectList } from './pages/ProjectList';
import Canvas from './pages/Canvas';
import { useSettingsSync } from './hooks/useThemeSync';
import { I18nProvider } from './components/I18nProvider';
import './styles/globals.css';

function App() {
  const settings = useSettingsSync();
  return (
    <I18nProvider locale={settings.locale}>
      <BrowserRouter>
        <div className="cb-app">
          <Routes>
            <Route path="/" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<Canvas />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
