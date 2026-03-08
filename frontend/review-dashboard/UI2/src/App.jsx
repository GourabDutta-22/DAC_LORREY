import React, { useState } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import InvoiceForm from './components/InvoiceForm';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import LorryHireSlipReview from './components/LorryHireSlipReview';
import FuelSlipReview from './components/FuelSlipReview';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1a73e8',
      dark: '#0d47a1',
    },
    secondary: {
      main: '#34a853',
    },
    background: {
      default: '#f4f7f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "system-ui", sans-serif',
    h3: {
      fontWeight: 900,
      letterSpacing: '-1.5px',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.5px',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
          borderRadius: 16,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          }
        }
      }
    }
  }
});

function AppContent() {
  const { user, loading } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [lorrySlipInvoiceId, setLorrySlipInvoiceId] = useState(null);
  const [fuelSlipInvoiceId, setFuelSlipInvoiceId] = useState(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return showSignup ? (
      <Signup onToggle={() => setShowSignup(false)} />
    ) : (
      <Login onToggle={() => setShowSignup(true)} />
    );
  }

  if (currentView === 'lorryHireSlip' && lorrySlipInvoiceId) {
    return (
      <LorryHireSlipReview
        invoiceId={lorrySlipInvoiceId}
        onBack={() => { setCurrentView('dashboard'); setLorrySlipInvoiceId(null); }}
        onOpenFuelSlip={() => {
          setFuelSlipInvoiceId(lorrySlipInvoiceId);
          setLorrySlipInvoiceId(null);
          setCurrentView('fuelSlip');
        }}
      />
    );
  }

  if (currentView === 'fuelSlip' && fuelSlipInvoiceId) {
    return (
      <FuelSlipReview
        invoiceId={fuelSlipInvoiceId}
        onBack={() => { setCurrentView('dashboard'); setFuelSlipInvoiceId(null); }}
      />
    );
  }

  return currentView === 'dashboard' ? (
    <Dashboard
      onUploadNew={() => setCurrentView('upload')}
      onOpenLorrySlip={(id) => { setLorrySlipInvoiceId(id); setCurrentView('lorryHireSlip'); }}
      onOpenFuelSlip={(id) => { setFuelSlipInvoiceId(id); setCurrentView('fuelSlip'); }}
    />
  ) : (
    <InvoiceForm onBack={() => setCurrentView('dashboard')} />
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
