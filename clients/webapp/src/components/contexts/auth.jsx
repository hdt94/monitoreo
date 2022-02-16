import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import useArray from "components/pages/common/useArray";
import { authReducer, defineActions, initState, setupAuthSubscription } from "state/auth";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [errors, appendError, removeError] = useArray([]);
  const [state, dispatch] = useReducer(authReducer, initState);
  const actions = useMemo(() => defineActions(dispatch), []);
  
  useEffect(() => {
    const unsubscribe = setupAuthSubscription({ actions, onError: appendError });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ errors, ...actions, ...state }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
