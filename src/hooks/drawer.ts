import { useMemo, useState } from 'react';

type UseDrawerHook = {
  readonly state: Readonly<Record<string, boolean>>;
  open: (key: string) => void;
  close: (key: string) => void;
  toggle: (key: string) => void;
};

/**
 * A utility hook that can manage handling the state of multiple drawers.
 *
 * @throws Will thrown an error if the key passed to `open`, `close`, or `toggle`
 * isn't a key of `initialValue`
 * @example
 *
 * ```ts
 * const drawer = useDrawer({
 *  myDrawer: false,
 *  anotherDrawer: false
 * });
 *
 * ...
 *
 * drawer.open('myDrawer')
 * drawer.open('badKey') // This will throw an error!
 * ```
 */
const useDrawer = (initialValue: Record<string, boolean>): UseDrawerHook => {
  const [drawerState, setDrawerState] = useState<Record<string, boolean>>(initialValue);
  const validKeys = useMemo(() => new Set(Object.keys(initialValue)), []);
  const open = (key: string) => {
    if (!validKeys.has(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    setDrawerState(prevState => ({
      ...prevState,
      [key]: true
    }));
  };

  const close = (key: string) => {
    if (!validKeys.has(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    setDrawerState(prevState => ({
      ...prevState,
      [key]: false
    }));
  };

  const toggle = (key: string) => {
    if (!validKeys.has(key)) {
      throw new Error(`Invalid key: ${key}`);
    }

    setDrawerState(prevState => ({
      ...prevState,
      [key]: true
    }));
  };

  return {
    state: drawerState,
    open,
    close,
    toggle
  };
};

export default useDrawer;
