import { useContext } from 'react';
import ReservationContext from '../contexts/ReservationContext';
import UserContext from '../contexts/UserContext';
import type {
  CreateReservationOpts,
  Reservation,
  UpdateReservationOpts
} from '../types/API';
import API from '../util/API';
import { formatDate } from '../util/date';

type UserReservationHook = {
  readonly state: Reservation[];
  createReservation: (opts: CreateReservationOpts) => Promise<Reservation>;
  initAllReservations: () => Promise<Reservation[]>;
  update: (opts: UpdateReservationOpts) => Promise<void>;
  /**
   * @param itemId Refers to the ID of the item in the `item` table
   */
  getReservationsForItem: (itemId: number) => Promise<Reservation[]>;
  /**
   * If a userId is passed, this will load all reservations for the user with
   * that ID. Otherwise, this function will load all reservations for the current user
   */
  getReservationsForUser: (userId?: number) => Promise<Reservation[]>;
  deleteReservation: (reservationId: number) => Promise<void>;
};

const useReservations = (): UserReservationHook => {
  const context = useContext(ReservationContext);
  const userContext = useContext(UserContext);

  if (!context || !userContext) {
    throw new Error(
      `Invalid hook call for useReservations(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const createReservation = async (opts: CreateReservationOpts): Promise<Reservation> => {
    const reservation = await API.createReservation(opts);

    reservation.startDateTime = formatDate(reservation.startDateTime);
    reservation.endDateTime = formatDate(reservation.endDateTime);

    dispatch({
      type: 'ADD_RESERVATION',
      payload: reservation
    });

    return reservation;
  };

  const initAllReservations = async (): Promise<Reservation[]> => {
    const reservations = await API.getAllReservations();

    reservations.sort((a, b) => Date.parse(b.created) - Date.parse(a.created));

    reservations.forEach(reservation => {
      reservation.startDateTime = formatDate(reservation.startDateTime);
      reservation.endDateTime = formatDate(reservation.endDateTime);
    });

    dispatch({
      type: 'SET_RESERVATIONS',
      payload: reservations
    });

    return reservations;
  };

  const update = async (opts: UpdateReservationOpts): Promise<void> => {
    const { admin, startDateTime, endDateTime, status, ID } = await API.updateReservation(
      opts
    );

    dispatch({
      type: 'UPDATE',
      payload: {
        reservationId: ID,
        status,
        admin,
        startDateTime,
        endDateTime
      }
    });
  };

  const getReservationsForItem = async (itemId: number): Promise<Reservation[]> => {
    const reservations = await API.getReservationsForItem(itemId);
    return reservations;
  };

  const getReservationsForUser = async (userId?: number): Promise<Reservation[]> => {
    const reservations = await API.getReservationsForUser(userId ?? userContext.state.ID);

    dispatch({
      type: 'SET_RESERVATIONS',
      payload: reservations
    });

    return reservations;
  };

  const deleteReservation = async (reservationId: number): Promise<void> => {
    await API.deleteReservation(reservationId);

    dispatch({
      type: 'DELETE',
      payload: {
        reservationId
      }
    });
  };

  return {
    state,
    createReservation,
    initAllReservations,
    update,
    getReservationsForItem,
    getReservationsForUser,
    deleteReservation
  };
};

export default useReservations;
