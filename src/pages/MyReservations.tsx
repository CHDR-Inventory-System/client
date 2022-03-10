import '../scss/my-reservations.scss';
import React, { useEffect, useMemo } from 'react';
import SimpleBar from 'simplebar-react';
import { Collapse, notification } from 'antd';
import { BsCalendarX } from 'react-icons/bs';
import ReservationCard from '../components/ReservationCard';
import Navbar from '../components/Navbar';
import { Reservation, ReservationStatus } from '../types/API';
import useReservations from '../hooks/reservation';
import useLoader from '../hooks/loading';
import LoadingSpinner from '../components/LoadingSpinner';
import useUser from '../hooks/user';
import NoContent from '../components/dashboard/NoContent';

const header = (
  <header className="page-header">
    <h2>My Reservations</h2>
    <p>
      All of your and past and current reservations will appear here. If you cancel a
      reservation, you&apos;ll need to submit a new one.
    </p>
  </header>
);

const STATUSES: ReservationStatus[] = [
  'Approved',
  'Cancelled',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

const MyReservations = (): JSX.Element => {
  const reservation = useReservations();
  const user = useUser();
  const loader = useLoader();
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

    reservation.state.forEach(res => {
      resMap[res.status].push(res);
    });

    return resMap;
  }, [reservation.state]);

  const reservationMapKeys = useMemo(
    () => Object.keys(reservationMap) as ReservationStatus[],
    []
  );

  const loadReservations = async () => {
    loader.startLoading();

    try {
      await reservation.getReservationsForUser(user.state.ID);
    } catch {
      loader.setError(true);
      notification.error({
        message: 'Error Loading Reservations',
        description: `
          An error occurred while loading your reservations,
          refresh the page to try again.`
      });
    }

    loader.stopLoading();
  };

  const reservationList = useMemo(
    () =>
      reservationMapKeys.map((key, index) => {
        if (reservationMap[key].length === 0) {
          return null;
        }

        return (
          <div className="reservations-container" key={index}>
            <Collapse
              bordered={false}
              defaultActiveKey={STATUSES}
              className="reservation-collapse"
            >
              <Collapse.Panel header={<h2>{key}</h2>} key={key}>
                <SimpleBar>
                  <div className="reservations">
                    {reservationMap[key].map(res => (
                      <ReservationCard key={res.ID} reservation={res as Reservation} />
                    ))}
                  </div>
                </SimpleBar>
              </Collapse.Panel>
            </Collapse>
          </div>
        );
      }),
    [reservation.state]
  );

  useEffect(() => {
    document.title = 'CHDR Inventory - Reservations';
    loadReservations();
  }, []);

  if (loader.isLoading) {
    return (
      <div className="my-reservations">
        <Navbar />
        {header}
        <LoadingSpinner text="Loading Reservations..." />
      </div>
    );
  }

  if (reservation.state.length === 0 || loader.hasError) {
    return (
      <div className="my-reservations">
        <Navbar />
        {header}
        <NoContent
          icon={<BsCalendarX size={84} />}
          className="empty-reservation-list"
          text={
            loader.hasError
              ? 'Error loading reservations.'
              : "Looks like you don't have any reservations."
          }
        />
      </div>
    );
  }

  return (
    <div className="my-reservations">
      <Navbar />
      {header}
      {reservationList}
    </div>
  );
};

export default MyReservations;
