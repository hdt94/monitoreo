import { createContext, useContext } from 'react';

import SubdomainProvider from './common/SubdomainProvider';

import subdomainInstance from 'state/analytics';

const ReactContext = createContext();

export function AnalyticsProvider({ children }) {
  return (
    <SubdomainProvider {...{ ReactContext, subdomainInstance }}>
      {children}
    </SubdomainProvider>
  )
}

export function useAnalytics() {
  return useContext(ReactContext);
}
