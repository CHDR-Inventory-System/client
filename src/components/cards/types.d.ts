// Types that are shared across card components
export type Credentials = {
  nid: string;
  email: string;
  password: string;
};

export type AuthError = {
  title: string;
  message: string;
};
