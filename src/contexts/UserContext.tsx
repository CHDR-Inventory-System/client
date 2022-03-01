import React, { createContext, useMemo, useReducer } from 'react';
import userReducer, { UserAction } from '../reducers/user';
import { User } from '../types/API';

export type UserContextType = {
  state: User;
  dispatch: React.Dispatch<UserAction>;
};

type UserProviderProps = {
  children: React.ReactNode;
  initialValue: User | null;
};

const UserContext = createContext<UserContextType | null>(null);

const UserProvider = ({ children, initialValue }: UserProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(userReducer, initialValue || ({} as User));
  const providerValue = useMemo(() => ({ state, dispatch }), [state]);

  return <UserContext.Provider value={providerValue}>{children}</UserContext.Provider>;
};

export { UserContext as default, UserProvider };
