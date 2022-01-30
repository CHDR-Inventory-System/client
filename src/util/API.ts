import axios from 'axios';
import { User, CreateAccountOptions, JWT, Item, Reservation } from '../types/API';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4565/api' : '/inventory/api';

class API {
  static async login(nid: string, password: string): Promise<User & JWT> {
    const response = await axios.post('/users/login', {
      nid,
      password
    });

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

  static async getAllUsers(): Promise<User[]> {
    const response = await axios.get('/users/');
    return response.data;
  }

  static async getAllItems(): Promise<Item[]> {
    const response = await axios.get('/inventory/');
    return response.data;
  }

  static async getItem(id: number): Promise<Item> {
    const response = await axios.get(`/inventory/${id}`);
    return response.data;
  }

  static async getAllReservations(): Promise<Reservation[]> {
    const response = await axios.get('/reservations/');
    return response.data;
  }
}

export default API;
