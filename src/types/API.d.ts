export type CreateAccountOptions = {
  nid: string;
  email: string;
  password: string;
};

export type UserRole = 'Super' | 'Admin' | 'User';

export type JWT = {
  token: string;
};

export type User = {
  ID: number;
  created: string;
  email: string;
  role: UserRole;
  nid: string;
};
