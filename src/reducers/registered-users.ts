import { User, UserRole } from '../types/API';

export type RegisteredUsersAction =
  | {
      type: 'SET_USERS';
      payload: User[];
    }
  | {
      type: 'UPDATE_ROLE';
      payload: {
        userId: number;
        role: UserRole;
      };
    };

const registeredUsersReducer = (state: User[], action: RegisteredUsersAction): User[] => {
  switch (action.type) {
    case 'SET_USERS':
      return action.payload;
    case 'UPDATE_ROLE':
      return state.map(user => {
        if (user.ID === action.payload.userId) {
          user.role = action.payload.role;
        }

        return user;
      });
    default:
      throw new Error(`Invalid action for registeredUsers reducer: ${action}`);
  }
};

export default registeredUsersReducer;
