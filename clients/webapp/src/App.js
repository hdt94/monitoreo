import React, { useEffect } from 'react';
import { useRoutes, BrowserRouter } from 'react-router-dom';
import AdapterDateFns from '@date-io/date-fns';
import { LocalizationProvider } from '@mui/lab';

import { routes } from './components/routes';

import Layout from './components/layout/Layout';
import Login from './components/pages/Login';

import { AnalyticsProvider } from './components/contexts/analytics';
import { useAuth } from 'components/contexts/auth';
import { useConnection } from './components/contexts/connection';

import { RegistryProvider } from './state/registry';

function RoutesContent() {
  const routesElements = useRoutes(routes);

  return routesElements;
}

export default function App() {
  const { isAuthenticated } = useAuth();
  const { connectionRef, errors } = useConnection();

  useEffect(() => {
    const status = connectionRef.current.getStatus();

    console.log('CONNECTION STATUS: ', status);
  }, []);
  useEffect(() => {
    if (!isAuthenticated) {
      connectionRef.current.unsubscribeAll();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? (
    <BrowserRouter>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Layout errors={errors}>
          <RegistryProvider>
            <AnalyticsProvider>
              <RoutesContent />
            </AnalyticsProvider>
          </RegistryProvider>
        </Layout>
      </LocalizationProvider>
    </BrowserRouter>
  ) : (
    <Login />
  );
}
