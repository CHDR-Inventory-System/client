/* eslint-disable */
import '../scss/my-reservations.scss';
import React, { useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import mockReservations from '../assets/mocks/reservations.json';
import ReservationCard from '../components/ReservationCard';
import { Reservation, ReservationStatus } from '../types/API';
import useReservations from '../hooks/reservation';
import SimpleBar from 'simplebar-react';

const MyReservations = (): JSX.Element => {
  // const reservation  = useReservations();

  const reservationMap = useMemo(() => {
    const resMap = {
      Pending: [],
      Approved: [],
      'Checked Out': [],
      Cancelled: [],
      Late: [],
      Missed: [],
      Denied: [],
      Returned: []
    } as Record<ReservationStatus, Reservation[]>;

    (mockReservations as Reservation[]).forEach(res => {
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
      <header className="page-title">
        <h2>My Reservations</h2>
        <p>
          All of your reservations will appear here. If you cancel a reservation,
          you&apos;ll need to submit a new one.
        </p>
      </header>
      {reservationMapKeys.map(key => {
        if (reservationMap[key].length === 0) {
          return null;
        }

        return (
          <div className="reservations-container">
            <h2>{key}</h2>
            <SimpleBar>
              <div className="reservations">
                {reservationMap[key].map(res => (
                  <ReservationCard key={res.ID} reservation={res as Reservation} />
                ))}
              </div>
            </SimpleBar>
          </div>
        );
      })}
    </div>
  );
};

export default MyReservations;
