import { useEffect, useMemo, useReducer } from 'react';

import { useConnection } from 'components/contexts/connection';

export default function SubdomainProvider({ children, ReactContext, subdomainInstance }) {
  const [state, dispatch] = useReducer(
    subdomainInstance.reduce,
    subdomainInstance.defineInitialState()
  );
  const { setActions } = useConnection();

  const actions = useMemo(() =>
    subdomainInstance.defineActions({ dispatch }), []);

  useEffect(() => {
    const { subdomainName } = subdomainInstance;

    setActions({ actions, subdomainName });
  }, []);

  return (
    <ReactContext.Provider value={{ ...actions, ...state }}>
      {children}
    </ReactContext.Provider>
  );
}
