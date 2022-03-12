import { useContext, useMemo } from 'react';
import Cookies from 'js-cookie';
import UserContext from '../contexts/UserContext';
import API from '../util/API';
import type {
  CreateAccountOptions,
  User,
  ResetPasswordOpts,
  UpdateEmailOpts
} from '../types/API';

type UseUserHook = {
  readonly state: Readonly<User> & {
    readonly firstName: string;
    readonly lastName: string;
  };
  init: (user: User) => void;
  /**
   * Makes a call to the API to log a user in. If successful, this also sets
   * the `user` field in {@link AsyncStorage} to the value of the current user.
   *
   * @throws {AxiosError} Will throw an error if login was unsuccessful
   */
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  createAccount: (opts: CreateAccountOptions) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyAccount: (userId: number, verificationCode: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (opts: ResetPasswordOpts) => Promise<void>;
  /**
   * Makes an API call that sends the email allowing a user to update
   * their email
   */
  sendUpdateEmail: () => Promise<void>;
  updateEmail: (opts: UpdateEmailOpts) => Promise<void>;
  updateName: (firstName: string, lastName: string) => Promise<void>;
  isAdminOrSuper: () => boolean;
  /**
   * Checks localStorage and information in cookies to see if the user is logged in.
   * Note that this my not be 100% accurate and fool-proof.
   */
  isAuthenticated: () => boolean;
};

const updateLocalStorage = (updatedUser: Partial<User>) => {
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser) as User;

      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          ...updatedUser
        })
      );
    } catch {
      // Ignored
    }
  }
};

/**
 * Handles managing state and API calls for the current user
 */
const useUser = (): UseUserHook => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useUser(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;
  const [firstName, ...lastName] = useMemo(
    () => (state.fullName ? state.fullName.split(' ') : []),
    [state.fullName]
  );

  const init = (user: User) => {
    dispatch({
      type: 'LOG_IN',
      payload: user
    });
  };

  const login = async (email: string, password: string): Promise<User> => {
    // Don't need to store the user's token in localStorage since it's handled
    // as a cookie by the browser
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...user } = await API.login(email, password);

    localStorage.setItem('user', JSON.stringify(user));

    init(user);

    return user;
  };

  const logout = async () => {
    try {
      await API.logout();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    localStorage.clear();
    Cookies.remove(process.env.COOKIE_CSRF_TOKEN_KEY);
    Cookies.remove(process.env.COOKIE_SESSION_EXP_KEY);
    dispatch({ type: 'LOG_OUT' });
  };

  const createAccount = async (opts: CreateAccountOptions) => {
    await API.createAccount(opts);
  };

  const verifyAccount = async (
    userId: number,
    verificationCode: string
  ): Promise<void> => {
    await API.verifyAccount(userId, verificationCode);
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    await API.resendVerificationEmail(email);
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    await API.sendPasswordResetEmail(email);
  };

  const resetPassword = async (opts: ResetPasswordOpts): Promise<void> => {
    await API.resetPassword(opts);
  };

  const sendUpdateEmail = async (): Promise<void> => {
    await API.sendUpdateEmail(state.ID, state.email);
  };

  const updateEmail = async (opts: UpdateEmailOpts): Promise<void> => {
    await API.updateEmail(opts);

    updateLocalStorage({ email: opts.email });

    dispatch({
      type: 'UPDATE_EMAIL',
      payload: opts.email
    });
  };

  const updateName = async (first: string, last: string): Promise<void> => {
    const fullName = `${first.trim()} ${last.trim()}`;

    await API.updateName(state.ID, fullName);

    updateLocalStorage({ fullName });

    dispatch({
      type: 'UPDATE_NAME',
      payload: fullName
    });
  };

  const isAdminOrSuper = () => state.role === 'Admin' || state.role === 'Super';

  const isAuthenticated = (): boolean => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '') as User | null;
      const hasMissingValues = Object.values(user || {}).some(
        value => value === null || value === undefined
      );
      const csrfToken = Cookies.get(process.env.COOKIE_CSRF_TOKEN_KEY);
      const sessionExpiration =
        parseInt(Cookies.get(process.env.COOKIE_SESSION_EXP_KEY) || '', 10) * 1000;

      return (
        !!user &&
        !hasMissingValues &&
        !!csrfToken &&
        !Number.isNaN(sessionExpiration) &&
        Date.now() < sessionExpiration
      );
    } catch {
      return false;
    }
  };

  return {
    state: {
      ...state,
      firstName,
      lastName: lastName.join(' ')
    },
    init,
    login,
    logout,
    createAccount,
    resendVerificationEmail,
    verifyAccount,
    sendPasswordResetEmail,
    resetPassword,
    sendUpdateEmail,
    updateEmail,
    updateName,
    isAdminOrSuper,
    isAuthenticated
  };
};

export default useUser;
