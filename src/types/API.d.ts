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
  fullName: string;
};

export type ItemImage = {
  ID: number;
  created: string;
  imagePath: string;
  itemChild: number;
};

export type Item = {
  ID: number;
  available: boolean;
  barcode: string;
  children?: Omit<Item, 'images'>[];
  created: string;
  description: string | null;
  images: Image[];
  item: number;
  location: string;
  main: boolean;
  moveable: boolean;
  name: string;
  purchaseDate: string | null;
  quantity: number;
  serial: string | null;
  type: string;
  vendorName: string | null;
  vendorPrice: number | null;
};
