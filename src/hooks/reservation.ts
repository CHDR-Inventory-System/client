import { useContext } from 'react';
import moment from 'moment';
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
  /**
   * @param itemId Refers to the ID of the item in the `item` table
   */
  getReservationsForItem: (itemId: number) => Promise<Reservation[]>;
};

// The server returns GMT dates so we need to add 5 hours to convert it to EST
const formatDate = (date: string) =>
  moment(date).add({ hours: 5 }).format('MMM D, YYYY, hh:mm A');

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

  const getReservationsForItem = async (itemId: number): Promise<Reservation[]> => {
    const reservations = await API.getReservationsForItem(itemId);
    return reservations;
  };

  return {
    state,
    createReservation,
    initAllReservations,
    updateStatus,
    getReservationsForItem
  };
};

export default useReservations;
