import type { User } from '../types/API';

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
    }
  | {
      type: 'UPDATE_NAME';
      payload: string;
    };

const userReducer = (state: User, action: UserAction): User => {
  switch (action.type) {
    case 'LOG_IN':
      return action.payload;
    case 'LOG_OUT':
      return {} as User;
    case 'UPDATE_EMAIL':
      return {
        ...state,
        email: action.payload
      };
    case 'UPDATE_NAME':
      return {
        ...state,
        fullName: action.payload
      };
    default:
      throw new Error(`Invalid action for user reducer: ${action}`);
  }
};

export default userReducer;
