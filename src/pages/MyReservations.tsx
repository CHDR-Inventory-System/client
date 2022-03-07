/* eslint-disable */
import '../scss/my-reservations.scss';
import React, { useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import mockReservations from '../assets/mocks/reservations.json';
import ReservationCard from '../components/ReservationCard';
import { Reservation, ReservationStatus } from '../types/API';
import useReservations from '../hooks/reservation';

const MyReservations = (): JSX.Element => {
  // const reservation  = useReservations();

  const reservationMap = useMemo(() => {
    const resMap = {
      Pending: [],
      'Checked Out': [],
      Cancelled: [],
      Denied: [],
      Late: [],
      Missed: [],
      Returned: [],
      Approved: []
    } as Record<ReservationStatus, Reservation[]>;

    (mockReservations as Reservation[]).forEach(res => {
      if (!resMap[res.status]) {
        resMap[res.status] = [];
      }

      resMap[res.status].push(res);
    });

    return resMap;
  }, []);

  const reservationMapKeys = useMemo(
    () => Object.keys(reservationMap) as ReservationStatus[],
    []
  );

  useEffect(() => {
    document.title = 'CHDR Inventory - Reservations';
  }, []);

  return (
    <div className="my-reservations">
      <Navbar sticky />
      <h2 className="page-title">Reservations</h2>
      {reservationMapKeys.map(key => {
        if (reservationMap[key].length === 0) {
          return null;
        }

        return (
          <div className="reservations-container">
            <h2>{key}</h2>
            <div className="reservations">
              {reservationMap[key].map(res => (
                <ReservationCard key={res.ID} reservation={res as Reservation} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MyReservations;
