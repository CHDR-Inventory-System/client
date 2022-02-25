import { useContext } from 'react';
import RegisteredUsersContext from '../contexts/RegisteredUsers';
import API from '../util/API';
import { BaseUser, UserRole } from '../types/API';

type UseRegisteredUsersHook = {
  readonly state: BaseUser[];
  init: () => Promise<BaseUser[]>;
  updateRole: (userId: number, role: UserRole) => Promise<void>;
};

/**
 * Handles managing state and API calls for all users from the database.
 * This is really only used for admins and super users.
 */
const useRegisteredUsers = (): UseRegisteredUsersHook => {
  const context = useContext(RegisteredUsersContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useRegisteredUsers(). Hooks can only
      be called inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const init = async (): Promise<BaseUser[]> => {
    const users = await API.getAllUsers();

    users.forEach(user => {
      user.created = new Date(user.created).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      });
    });

    dispatch({
      type: 'SET_USERS',
      payload: users
    });

    return users;
  };

  const updateRole = async (userId: number, role: UserRole) => {
    await API.updateUserRole(userId, role);

    dispatch({
      type: 'UPDATE_ROLE',
      payload: {
        userId,
        role
      }
    });
  };

  return {
    state,
    init,
    updateRole
  };
};

export default useRegisteredUsers;
