import React, { createContext, useMemo, useReducer } from 'react';
import inventoryReducer, { InventoryAction } from '../reducers/inventory';
import { Item } from '../types/API';

export type InventoryContextType = {
  state: Item[];
  dispatch: React.Dispatch<InventoryAction>;
};

type InventoryProviderProps = {
  children: React.ReactNode;
};

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const InventoryProvider = ({ children }: InventoryProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(inventoryReducer, []);
  const providerValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <InventoryContext.Provider value={providerValue}>
      {children}
    </InventoryContext.Provider>
  );
};

export { InventoryContext as default, InventoryProvider };
