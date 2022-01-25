export type CreateAccountOptions = {
  nid: string;
  email: string;
  password: string;
};

export type User = {
  email: string;
  role: 'super' | 'admin' | 'user';
  id: number;
};
