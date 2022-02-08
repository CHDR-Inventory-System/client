import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import API from '../util/API';
import { CreateAccountOptions, User } from '../types/API';

type UseUserHook = {
  /**
   * Makes a call to the API to log a user in. If successful, this also sets
   * the `user` field in {@link AsyncStorage} to the value of the current user.
   *
   * @throws {AxiosError} Will throw an error if login was unsuccessful
   */
  login: (nid: string, password: string) => Promise<User>;
  logout: () => void;
  createAccount: (opts: CreateAccountOptions) => Promise<void>;
  resendVerificationEmail: (userId: number, email: string) => Promise<void>;
  readonly state: Readonly<User>;
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

  const login = async (nid: string, password: string): Promise<User> => {
    const user = await API.login(nid, password);

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

  const resendVerificationEmail = async (
    userId: number,
    email: string
  ): Promise<void> => {
    await API.resendVerificationEmail(userId, email);
  };

  return {
    state,
    login,
    logout,
    createAccount,
    resendVerificationEmail
  };
};

export default useUser;
