import { createContext, useContext, useEffect, useRef, useState } from 'react';

import useErrors from 'components/common/useErrors';

import connection from 'services/connection';

const ReactContext = createContext(null);

function useInitConnection({ appendErrorRef, subdomainActionsMapRef }) {
// function useInitConnection({ appendErrorRef, connectionRef, subdomainActionsMapRef }) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const onConnect = () => {
      console.log('CONNECTED');
    };
    const onDisconnect = () => {
      console.log('DISCONNECTED');
    };
    const onError = (error) => appendErrorRef.current(error);
    const onMessage = (message) => {
      const {
        meta: { category, context: subdomainName },
        payload,
        type,
      } = message;

      const actions = subdomainActionsMapRef.current[subdomainName];
      if (!actions) {
        return onError({ message: `Unknown subdomain "${subdomainName}"` });
      }

      const action = actions[type];
      if (!action) {
        return onError({
          message: `Unknown action "${type}" in subdomain "${subdomainName}`
        });
      }

      try {
        action({ meta: { category }, payload });
      } catch (err) {
        onError({ message: err?.message || err });
      }
    };

    connection.init({
      onConnect,
      onDisconnect,
      onError,
      onMessage,
    })

    setInitialized(true);
  }, []);

  return initialized;
}


export function useConnection() {
  return useContext(ReactContext);
}

export function ConnectionProvider({ children }) {
  const connectionRef = useRef(connection);
  const [subdomainActionsMap, setSubdomainActionsMap] = useState({});
  const [errors, appendError] = useErrors();

  const appendErrorRef = useRef();
  appendErrorRef.current = appendError;
  const subdomainActionsMapRef = useRef();
  subdomainActionsMapRef.current = subdomainActionsMap;

  const initialized = useInitConnection({
    appendErrorRef,
    // connectionRef,
    subdomainActionsMapRef
  })

  const setActions = ({ actions, subdomainName }) => {
    // if (subdomainName in subdomainActionsMap) {
    //   throw new Error(`Actions for subdomain "${subdomainName}" already set`);
    // }

    setSubdomainActionsMap((prev) => ({ ...prev, [subdomainName]: actions }));
  };

  // TODO loading skeleton
  return initialized ? (
    <ReactContext.Provider
      value={{ connectionRef, errors, setActions }}
    >
      {children}
    </ReactContext.Provider>
  ) : <div>Loading...</div>;
}

