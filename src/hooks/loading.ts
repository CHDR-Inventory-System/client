import { useState } from 'react';

type StopLoadingOpts = {
  delay?: number;
};

export type UseLoadingHook = {
  readonly isLoading: boolean;
  readonly hasError: boolean;
  /**
   * Note that this function will also call `setError(false)`
   */
  startLoading: () => void;
  stopLoading: (opts?: StopLoadingOpts) => void;
  toggleLoading: (isLoading: boolean) => void;
  /**
   * A helper function used to delay code execution in async functions.
   *
   * @WARNING Don't use this in production
   *
   * @param ms The amount of time (in milliseconds) to wait.
   */
  sleep: (ms: number) => Promise<void>;
  setError: (hasError: boolean) => void;
};

/**
 * A custom hook that pairs will with the `Loading` component. This
 * helps components manage their loading state.
 *
 * @param initialValue The initial loading state value (`false` by default)
 *
 * @example
 * ```jsx
 * const Component = () => {
 *  const loader = useLoading();
 *
 *  const fetchData = async () => {
 *    loading.startLoading();
 *    // Doing some work might take a while...
 *    loader.stopLoading();
 *  }
 *
 *
 *  return (
 *    <SomeComponent isLoading={loader.isLoading}/>
 *  );
 * }
 * ```
 */
const useLoader = (initialValue = false): UseLoadingHook => {
  const [isLoading, setLoading] = useState(initialValue);
  const [hasError, setHasError] = useState(false);

  const startLoading = () => {
    setLoading(true);
    setHasError(false);
  };

  const stopLoading = (opts?: StopLoadingOpts) => {
    setTimeout(() => setLoading(false), opts?.delay ?? 0);
  };

  const setError = (err: boolean) => setHasError(err);

  const toggleLoading = (loading: boolean) => setLoading(loading);

  const sleep = (ms: number): Promise<void> => {
    if (process.env.NODE_ENV !== 'development') {
      // There's no sleeping in production!
      return Promise.resolve();
    }

    // eslint-disable-next-line no-console
    console.warn("Don't use sleep() in a production environment!");

    return new Promise(resolve => setTimeout(resolve, ms));
  };

  return {
    isLoading,
    hasError,
    startLoading,
    setError,
    stopLoading,
    toggleLoading,
    sleep
  };
};

export default useLoader;
