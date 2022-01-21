import axios from 'axios';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4565/api' : '/csi';

type CreateAccountOptions = {
  nid: string;
  email: string;
  password: string;
};

class API {
  static async login(email: string, password: string): Promise<{ token: string }> {
    const response = await axios.post('/users/login', { email, password });

    return response.data;
  }

  static async createAccount({
    nid,
    email,
    password
  }: CreateAccountOptions): Promise<void> {
    const response = await axios.post('/users/register', {
      nid,
      email,
      password
    });

    return response.data;
  }
}

export default API;
