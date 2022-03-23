import axios, { AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  User,
  CreateAccountOptions,
  Item,
  Reservation,
  ItemImage,
  ImageUploadParams,
  ResetPasswordOpts,
  UserRole,
  CreateReservationOpts,
  UpdateReservationOpts,
  UpdateEmailOpts
} from '../types/API';
import APIError from './APIError';
import { AtLeast } from './types';

// HTTP methods that require the csrf token to be set as a header
const csrfMethods = new Set(['post', 'put', 'patch', 'delete']);
let cancelTokenSource = axios.CancelToken.source();

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? '/api' : process.env.PROD_API_URL;

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    API.hasActiveRequest = false;
    return response;
  },
  (error: AxiosError) => {
    const errorMessage = error.response?.data.error as string | undefined;

    API.hasActiveRequest = false;

    if (
      errorMessage?.toLowerCase().includes('missing cookie') &&
      error.response?.status === 401
    ) {
      localStorage.clear();
      Cookies.remove(process.env.COOKIE_CSRF_TOKEN_KEY);
      Cookies.remove(process.env.COOKIE_SESSION_EXP_KEY);
      window.location.replace('/#/auth');
      return Promise.resolve();
    }

    if (axios.isCancel(error)) {
      // A new cancel token needs to be generated on each request
      // https://github.com/axios/axios/issues/904#issuecomment-322054741
      cancelTokenSource = axios.CancelToken.source();

      // 499 represents a request that was cancelled by the user
      throw new APIError({
        cancelled: true,
        status: 499
      });
    }

    throw new APIError({
      description: error.response?.data.error || '',
      status: error.response?.status
    });
  }
);

axios.interceptors.request.use(config => {
  API.hasActiveRequest = true;
  config.cancelToken = cancelTokenSource.token;

  if (csrfMethods.has(config.method?.toLowerCase() || '')) {
    config.headers = config.headers || {};
    config.headers['X-CSRF-TOKEN'] = Cookies.get(process.env.COOKIE_CSRF_TOKEN_KEY) || '';
  }
  return config;
});

class API {
  /**
   * This is used to determine if {@link API.cancelRequests()} should generate
   * a new cancel token. Note that a new cancel token is only generated if there's
   * an active request
   */
  static hasActiveRequest = false;

  static cancelRequests(): void {
    if (API.hasActiveRequest) {
      cancelTokenSource.cancel('Request cancelled by user');
      cancelTokenSource = axios.CancelToken.source();
    }
  }

  static async login(email: string, password: string): Promise<User & { token: string }> {
    const response = await axios.post('/users/login', {
      email,
      password
    });

    return response.data;
  }

  static async logout(): Promise<void> {
    const response = await axios.post('/users/logout');
    return response.data;
  }

  static async createAccount(opts: CreateAccountOptions): Promise<void> {
    const response = await axios.post('/users/register', opts);
    return response.data;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const response = await axios.post('/users/resendVerificationEmail', {
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

  static async uploadImage({
    itemId,
    image,
    onUploadProgress
  }: ImageUploadParams): Promise<ItemImage> {
    const formData = new FormData();
    formData.append('image', image);

    const response = await axios.post(`/inventory/${itemId}/uploadImage`, formData, {
      onUploadProgress
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

  static async getAllUsers(): Promise<User[]> {
    const response = await axios.get('/users/');
    return response.data;
  }

  static async updateUserRole(userId: number, role: UserRole): Promise<void> {
    const response = await axios.patch(`/users/${userId}/role`, { role });
    return response.data;
  }

  static async verifyAccount(userId: number, verificationCode: string): Promise<void> {
    const response = await axios.patch('/users/verify', {
      userId,
      verificationCode
    });
    return response.data;
  }

  static async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await axios.post('/users/sendPasswordResetEmail', { email });
    return response.data;
  }

  static async resetPassword(opts: ResetPasswordOpts): Promise<void> {
    const response = await axios.post('/users/resetPassword', opts);
    return response.data;
  }

  static async createReservation({
    email,
    item,
    checkoutDate,
    returnDate,
    status,
    adminId
  }: CreateReservationOpts): Promise<Reservation> {
    const response = await axios.post('/reservations/', {
      email,
      item,
      status,
      adminId,
      startDateTime: checkoutDate,
      endDateTime: returnDate
    });

    return response.data;
  }

  static async getAllReservations(): Promise<Reservation[]> {
    const response = await axios.get('/reservations/');
    return response.data;
  }

  static async updateReservation({
    reservationId,
    adminId,
    status,
    startDateTime,
    endDateTime
  }: UpdateReservationOpts): Promise<Reservation> {
    const response = await axios.patch(`/reservations/${reservationId}/status`, {
      status,
      adminId,
      startDateTime,
      endDateTime
    });
    return response.data;
  }

  static async getReservationsForItem(itemId: number): Promise<Reservation[]> {
    const response = await axios.get(`/reservations/item/${itemId}`);
    return response.data;
  }

  /**
   * Sends an email to the user that contains a link to change their email
   */
  static async sendUpdateEmail(userId: number, email: string): Promise<void> {
    const response = await axios.patch(`/users/${userId}/email`, { email });
    return response.data;
  }

  static async updateEmail(opts: UpdateEmailOpts): Promise<void> {
    const response = await axios.patch('/users/updateEmail', opts);
    return response.data;
  }

  static async updateName(userId: number, fullName: string): Promise<void> {
    const response = await axios.patch(`/users/${userId}/updateName`, { fullName });
    return response.data;
  }

  static async getReservationsForUser(userId: number): Promise<Reservation[]> {
    const response = await axios.get(`/reservations/user/${userId}`);
    return response.data;
  }

  static async deleteReservation(reservationId: number): Promise<void> {
    const response = await axios.delete(`/reservations/${reservationId}`);
    return response.data;
  }
}

export default API;
