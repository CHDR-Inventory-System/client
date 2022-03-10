import { useState } from 'react';

type UseModalHook = {
  readonly isVisible: boolean;
  open: () => void;
  close: () => void;
};

const useModal = (): UseModalHook => {
  const [isVisible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return { isVisible, open, close };
};

export default useModal;
