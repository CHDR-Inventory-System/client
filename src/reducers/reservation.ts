import type { User, Reservation, ReservationStatus } from '../types/API';
import { formatDate } from '../util/date';

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
      type: 'UPDATE';
      payload: {
        reservationId: number;
        status?: ReservationStatus;
        /**
         * The admin who changed the status of this reservation
         */
        admin: User | null;
        startDateTime?: string;
        endDateTime?: string;
      };
    }
  | {
      type: 'DELETE';
      payload: {
        reservationId: number;
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
      return [action.payload, ...state];
    case 'UPDATE': {
      const { status, startDateTime, endDateTime, admin, reservationId } = action.payload;

      return state.map(reservation => {
        if (reservation.ID === reservationId) {
          reservation.status = status || reservation.status;

          reservation.startDateTime =
            (startDateTime && formatDate(startDateTime)) || reservation.endDateTime;

          reservation.endDateTime =
            (endDateTime && formatDate(endDateTime)) || reservation.endDateTime;

          reservation.admin = admin;
        }

        return reservation;
      });
    }
    case 'DELETE':
      return state.filter(reservation => reservation.ID !== action.payload.reservationId);
    default:
      throw new Error(`Invalid action ${action}`);
  }
};

export default reservationReducer;
