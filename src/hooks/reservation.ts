import { useContext } from 'react';
import ReservationContext from '../contexts/ReservationContext';
import type {
  CreateReservationOpts,
  Reservation,
  UpdateReservationStatusOpts
} from '../types/API';
import API from '../util/API';

type UserReservationHook = {
  readonly state: Reservation[];
  createReservation: (opts: CreateReservationOpts) => Promise<Reservation>;
  initAllReservations: () => Promise<Reservation[]>;
  updateStatus: (opts: UpdateReservationStatusOpts) => Promise<void>;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });

const useReservations = (): UserReservationHook => {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useReservations(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const createReservation = async (opts: CreateReservationOpts): Promise<Reservation> => {
    const reservation = await API.createReservation(opts);

    dispatch({
      type: 'ADD_RESERVATION',
      payload: reservation
    });

    return reservation;
  };

  const initAllReservations = async (): Promise<Reservation[]> => {
    const reservations = await API.getAllReservations();

    reservations.forEach(reservation => {
      reservation.startDateTime = formatDate(reservation.startDateTime);
      reservation.endDateTime = formatDate(reservation.startDateTime);
    });

    dispatch({
      type: 'SET_RESERVATIONS',
      payload: reservations
    });

    return reservations;
  };

  const updateStatus = async (opts: UpdateReservationStatusOpts): Promise<void> => {
    await API.updateReservationStatus(opts);

    dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        reservationId: opts.reservationId,
        status: opts.status
      }
    });
  };

  return {
    state,
    createReservation,
    initAllReservations,
    updateStatus
  };
};

export default useReservations;
