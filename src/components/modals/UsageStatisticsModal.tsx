import '../../scss/usage-statistics-modal.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { Button, Modal, Statistic } from 'antd';
import { BsBarChart } from 'react-icons/bs';
import moment from 'moment';
import { Item, Reservation } from '../../types/API';
import { BaseModalProps } from './base-modal-props';
import useLoader from '../../hooks/loading';
import LoadingSpinner from '../LoadingSpinner';
import NoContent from '../dashboard/NoContent';
import useReservations from '../../hooks/reservation';

type UsageStatisticsModalProps = BaseModalProps & {
  item: Item;
};

const padNumber = (value: number) => Math.floor(value).toString().padStart(2, '0');

/**
 * @param elapsedTime The total elapsed time in seconds
 */
const formatDuration = (elapsedTime: number) => {
  const days = elapsedTime / (60 * 60 * 24);
  const hours = Math.floor(elapsedTime / 3600) % 24;
  const totalSeconds = elapsedTime % 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `
    ${padNumber(days)}d
    ${padNumber(hours)}h
    ${padNumber(minutes)}m
    ${padNumber(seconds)}s
  `;
};

const UsageStatisticsModal = ({
  item,
  onClose,
  visible
}: UsageStatisticsModalProps): JSX.Element => {
  const loader = useLoader();
  const reservation = useReservations();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const reservationTimes = useMemo(
    () =>
      reservations.map(({ startDateTime, endDateTime }) =>
        moment(endDateTime).diff(startDateTime, 'seconds')
      ),
    [reservations]
  );

  const totalReservationTime = useMemo(
    () => reservationTimes.reduce((prev, curr) => prev + curr, 0),
    [reservations]
  );

  const longestReservationTime = useMemo(() => {
    const max = Math.max(...reservationTimes);
    return Number.isSafeInteger(max) ? max : 0;
  }, [reservationTimes]);

  const shortestReservationTime = useMemo(() => {
    const min = Math.min(...reservationTimes);
    return Number.isSafeInteger(min) ? min : 0;
  }, [reservationTimes]);

  const loadReservations = async () => {
    loader.startLoading();

    try {
      const res = await reservation.getReservationsForItem(item.item);
      setReservations(
        res.filter(({ status }) => status !== 'Cancelled' && status !== 'Denied')
      );
    } catch {
      loader.setError(true);
    }

    loader.stopLoading();
  };

  const renderModalBody = () => {
    if (loader.isLoading) {
      return <LoadingSpinner />;
    }

    if (loader.hasError) {
      return (
        <NoContent
          icon={<BsBarChart size={64} />}
          text="Error loading statistics"
          className="load-error"
        />
      );
    }

    return (
      <>
        <p className="modal-description">
          Usage statistics for <b>{item.name}</b>. Note that reservations that were{' '}
          <b>cancelled</b> or <b>denied</b> are not included in any calculations.
        </p>
        <div className="stat-row">
          <Statistic title="Total Reservations" value={reservations.length} />
        </div>
        <div className="stat-row">
          <Statistic
            title="Total Reservation Time"
            value={totalReservationTime}
            formatter={value => formatDuration(value as number)}
          />
          <Statistic
            title="Average Reservation Time"
            value={totalReservationTime / Math.max(reservations.length, 1)}
            formatter={value => formatDuration(value as number)}
          />
        </div>
        <div className="stat-row">
          <Statistic
            title="Longest Reservation"
            value={longestReservationTime}
            formatter={value => formatDuration(value as number)}
          />
          <Statistic
            title="Shortest Reservation"
            value={shortestReservationTime}
            formatter={value => formatDuration(value as number)}
          />
        </div>
      </>
    );
  };

  useEffect(() => {
    if (visible) {
      loadReservations();
    }
  }, [visible]);

  return (
    <Modal
      centered
      visible={visible}
      onCancel={onClose}
      title="Usage Statistics"
      className="usage-statistics-modal"
      footer={[
        <Button type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      {renderModalBody()}
    </Modal>
  );
};

export default UsageStatisticsModal;
