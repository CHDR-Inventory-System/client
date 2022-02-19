import axios from 'axios';
import { User, CreateAccountOptions } from '../types/API';
import APIError from './APIError';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development'
    ? process.env.DEBUG_API_URL
    : process.env.PROD_API_URL;

axios.interceptors.response.use(
  response => response,
  error => {
    if (axios.isCancel(error)) {
      // 499 represents a request that was cancelled by the user
      throw new APIError({
        cancelled: true,
        status: 499
      });
    }

    throw new APIError(error.response.data);
  }
);

class API {
  static async login(nid: string, password: string): Promise<User> {
    const response = await axios.post('/users/login', {
      nid,
      password
    });

    return response.data;
  }

  static async createAccount(opts: CreateAccountOptions): Promise<void> {
    const response = await axios.post('/users/register', {
      ...opts
    });

    return response.data;
  }

  static async resendVerificationEmail(userId: number, email: string): Promise<void> {
    const response = await axios.post('/users/resendVerificationEmail', {
      userId,
      email
    });

    return response.data;
  }
}

export default API;
