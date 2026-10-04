import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { GlobalStyles } from './styles/GlobalStyles';
import { StoreProvider } from './store/StoreProvider';
import { useStore } from './store/context';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { DirectorDashboard } from './pages/DirectorDashboard';
import { DistrictDashboard } from './pages/DistrictDashboard';

function Router() {
  const { session } = useStore();
  const [screen, setScreen] = useState<'landing' | 'login'>('landing');

  if (session) {
    // key — колдонуучу алмашканда бардык ички абал тазаланат
    const key = `${session.role}:${session.userId}`;
    switch (session.role) {
      case 'teacher': return <TeacherDashboard key={key} />;
      case 'parent': return <ParentDashboard key={key} />;
      case 'director': return <DirectorDashboard key={key} />;
      case 'district': return <DistrictDashboard key={key} />;
    }
  }

  if (screen === 'login') return <Login onBack={() => setScreen('landing')} />;
  return (
    <Landing
      onStart={() => {
        setScreen('login');
        window.scrollTo({ top: 0 });
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <StoreProvider>
        <Router />
      </StoreProvider>
    </ThemeProvider>
  );
}
