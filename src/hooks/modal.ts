import { useState } from 'react';

type UseModalHook = {
  readonly visible: boolean;
  open: () => void;
  close: () => void;
};

const useModal = (): UseModalHook => {
  const [visible, setVisible] = useState(false);

  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return { visible, open, close };
};

export default useModal;
