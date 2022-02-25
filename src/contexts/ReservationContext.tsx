import React, { createContext, useMemo, useReducer } from 'react';
import reservationReducer, { ReservationAction } from '../reducers/reservation';
import type { Reservation } from '../types/API';

export type ReservationContextType = {
  state: Reservation[];
  dispatch: React.Dispatch<ReservationAction>;
};

type ReservationProviderProps = {
  children: React.ReactNode;
};

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const ReservationProvider = ({ children }: ReservationProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(reservationReducer, []);
  const providerValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ReservationContext.Provider value={providerValue}>
      {children}
    </ReservationContext.Provider>
  );
};

export { ReservationContext as default, ReservationProvider };
