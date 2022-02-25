// Contains types that are shared across card components
import { CreateAccountOptions } from '../../types/API';

export type Credentials = CreateAccountOptions & {
  confirmedPassword: string;
};

export type CardProps = {
  className?: string;
  description: JSX.Element;
};
