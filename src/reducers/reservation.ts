import type { Reservation, ReservationStatus } from '../types/API';

export type ReservationAction =
  | {
      type: 'ADD_RESERVATION';
      payload: Reservation;
    }
  | {
      type: 'SET_RESERVATIONS';
      payload: Reservation[];
    }
  | {
      type: 'UPDATE_STATUS';
      payload: {
        reservationId: number;
        status: ReservationStatus;
      };
    };

const reservationReducer = (
  state: Reservation[],
  action: ReservationAction
): Reservation[] => {
  switch (action.type) {
    case 'SET_RESERVATIONS':
      return action.payload;
    case 'ADD_RESERVATION':
      return state.concat(action.payload);
    case 'UPDATE_STATUS':
      return state.map(reservation => {
        if (reservation.ID === action.payload.reservationId) {
          reservation.status = action.payload.status;
        }

        return reservation;
      });
    default:
      throw new Error(`Invalid action ${action}`);
  }
};

export default reservationReducer;
