import { User } from '../types/API';

type UserInitAction = {
  type: 'LOG_IN';
  payload: User;
};

type UserLogoutAction = {
  type: 'LOG_OUT';
};

export type UserAction = UserInitAction | UserLogoutAction;

const userReducer = (state: User, action: UserAction): User => {
  switch (action.type) {
    case 'LOG_IN':
      return { ...action.payload };
    case 'LOG_OUT':
      return {} as User;
    default:
      throw new Error(`Invalid action for user reducer: ${action}`);
  }
};

export default userReducer;
