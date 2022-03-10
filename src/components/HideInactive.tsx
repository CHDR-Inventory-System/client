import React, { useEffect, useRef, useState } from 'react';

type HideInactiveProps = {
  /**
   * The time in milliseconds before this element is hidden
   */
  timeout: number;
  children: React.ReactElement;
  enabled?: boolean;
};

/**
 * A utility wrapper component that sets the opacity of an element
 * to 0 when mouse movement hasn't been detected in the time specified
 * by `timeout`
 */
const HideInactive = ({
  timeout,
  children,
  enabled = true
}: HideInactiveProps): JSX.Element => {
  const timeLastMoved = useRef(Date.now());
  const intervalId = useRef(0);
  const [isHidden, setIsHidden] = useState(false);

  const checkDelta = () => setIsHidden(Date.now() - timeLastMoved.current >= timeout);

  const onMouseMove = () => {
    timeLastMoved.current = Date.now();
  };

  useEffect(() => {
    if (enabled) {
      document.addEventListener('mousemove', onMouseMove);
      intervalId.current = window.setInterval(checkDelta, 1_000);
    } else {
      window.clearInterval(intervalId.current);
      document.removeEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.clearInterval(intervalId.current);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [enabled]);

  return (
    <div
      style={{
        transition: 'opacity 0.2s ease-in-out',
        opacity: isHidden && enabled ? 0 : 1
      }}
    >
      {children}
    </div>
  );
};

export default HideInactive;
