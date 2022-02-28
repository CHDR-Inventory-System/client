import Cookies from 'js-cookie';
import { User } from '../types/API';

export type UserAction =
  | {
      type: 'LOG_IN';
      payload: User;
    }
  | {
      type: 'LOG_OUT';
    }
  | {
      type: 'UPDATE_EMAIL';
      payload: string;
    };

const userReducer = (state: User, action: UserAction): User => {
  switch (action.type) {
    case 'LOG_IN':
      return action.payload;
    case 'LOG_OUT':
      return {} as User;
    case 'UPDATE_EMAIL': {
      const user = Cookies.get('user') as User | undefined;

      if (user) {
        Cookies.set(
          'user',
          JSON.stringify({
            ...user,
            email: action.payload
          })
        );
      }
      return {
        ...state,
        email: action.payload
      };
    }
    default:
      throw new Error(`Invalid action for user reducer: ${action}`);
  }
};

export default userReducer;
