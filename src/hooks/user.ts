import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import API from '../util/API';
import type { CreateAccountOptions, User, ResetPasswordOpts } from '../types/API';

type UseUserHook = {
  readonly state: Readonly<User>;
  /**
   * Makes a call to the API to log a user in. If successful, this also sets
   * the `user` field in {@link AsyncStorage} to the value of the current user.
   *
   * @throws {AxiosError} Will throw an error if login was unsuccessful
   */
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  createAccount: (opts: CreateAccountOptions) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  verifyAccount: (userId: number, verificationCode: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (opts: ResetPasswordOpts) => Promise<void>;
};

const useUser = (): UseUserHook => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useUser(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const login = async (email: string, password: string): Promise<User> => {
    const user = await API.login(email, password);

    localStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'LOG_IN',
      payload: user
    });

    return user;
  };

  const logout = () => {
    localStorage.removeItem('user');
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

  return {
    state,
    login,
    logout,
    createAccount,
    resendVerificationEmail,
    verifyAccount,
    sendPasswordResetEmail,
    resetPassword
  };
};

export default useUser;
