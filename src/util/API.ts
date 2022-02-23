import axios from 'axios';
import {
  User,
  CreateAccountOptions,
  Item,
  Reservation,
  ItemImage,
  ImageUploadParams,
  BaseUser,
  UserRole
} from '../types/API';
import APIError from './APIError';
import { AtLeast } from './types';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';
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

  static async getAllItems(): Promise<Item[]> {
    const response = await axios.get('/inventory/');
    return response.data;
  }

  static async getItem(id: number): Promise<Item> {
    const response = await axios.get(`/inventory/${id}`);
    return response.data;
  }

  static async addItem(item: Partial<Item>): Promise<Item> {
    const response = await axios.post('/inventory/add', { ...item });
    return response.data;
  }

  static async addChildItem(
    itemId: number,
    item: AtLeast<Item, 'name' | 'type'>
  ): Promise<Item> {
    const response = await axios.post(`/inventory/${itemId}/addChild`, {
      ...item
    });
    return response.data;
  }

  static async deleteItem(id: number): Promise<void> {
    const response = await axios.delete(`/inventory/${id}`);
    return response.data;
  }

  static async updateItem(item: AtLeast<Item, 'ID'>): Promise<void> {
    const response = await axios.put(`/inventory/${item.ID}`, {
      ...item
    });
    return response.data;
  }

  static async getAllReservations(): Promise<Reservation[]> {
    const response = await axios.get('/reservations/');
    return response.data;
  }

  static async uploadImage({
    itemId,
    image,
    onUploadProgress,
    cancelToken
  }: ImageUploadParams): Promise<ItemImage> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post(`/inventory/${itemId}/uploadImage`, formData, {
      onUploadProgress,
      cancelToken
    });

    return response.data;
  }

  static async deleteImage(imageId: number): Promise<void> {
    const response = await axios.delete(`/inventory/image/${imageId}`);
    return response.data;
  }

  static async retireItem(itemId: number, retiredDate: Date | null): Promise<void> {
    const response = await axios.put(`/inventory/${itemId}/retire`, {
      date: retiredDate?.toLocaleDateString() || null
    });
    return response.data;
  }

  static async getAllUsers(): Promise<BaseUser[]> {
    const response = await axios.get('/users/');
    return response.data;
  }

  static async updateUserRole(userId: number, role: UserRole): Promise<void> {
    const response = await axios.patch(`/users/${userId}/role`, { role });
    return response.data;
  }
}

export default API;
