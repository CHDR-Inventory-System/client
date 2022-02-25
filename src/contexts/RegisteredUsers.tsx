import React, { createContext, useMemo, useReducer } from 'react';
import registeredUsersReducer, {
  RegisteredUsersAction
} from '../reducers/registeredUsers';
import { BaseUser } from '../types/API';

export type RegisteredUsersContextType = {
  state: BaseUser[];
  dispatch: React.Dispatch<RegisteredUsersAction>;
};

type UserProviderProps = {
  children: React.ReactNode;
};

const RegisteredUsersContext = createContext<RegisteredUsersContextType | null>(null);

const RegisteredUsersProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(registeredUsersReducer, []);
  const providerValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <RegisteredUsersContext.Provider value={providerValue}>
      {children}
    </RegisteredUsersContext.Provider>
  );
};

export { RegisteredUsersContext as default, RegisteredUsersProvider };
