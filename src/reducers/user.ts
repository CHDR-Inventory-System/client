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
      const user = localStorage.getItem('user') as User | null;

      if (user) {
        localStorage.setItem(
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
