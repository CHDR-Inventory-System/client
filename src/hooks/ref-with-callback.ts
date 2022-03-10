import { useRef, useCallback, MutableRefObject } from 'react';

type MountCallback<T> = (node: T) => void;
type HookReturnType<T> = [MutableRefObject<T | null>, (ref: T | null) => void];

/**
 * A utility hook that allows you to create a ref for a React Element and
 * listen for mount and unmount events for that element.
 */
function useRefWithCallback<T>(
  onMount: MountCallback<T>,
  onUnmount: MountCallback<T>
): HookReturnType<T> {
  const ref = useRef<T | null>(null);

  const setRef = useCallback(
    (node: T | null) => {
      if (ref.current) {
        onUnmount(ref.current);
      }

      ref.current = node;

      if (ref.current) {
        onMount(ref.current);
      }
    },
    [onMount, onUnmount]
  );

  return [ref, setRef];
}

export default useRefWithCallback;
