import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../scss/item-availability-modal.scss';
import '../../scss/react-big-calendar-overrides.scss';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'antd';
import moment from 'moment';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import { BsCalendarX } from 'react-icons/bs';
import classNames from 'classnames';
import { BaseModalProps } from './base-modal-props';
import { Item, Reservation, ReservationStatus } from '../../types/API';
import useLoader from '../../hooks/loading';
import LoadingSpinner from '../LoadingSpinner';
import useReservations from '../../hooks/reservation';
import NoContent from '../dashboard/NoContent';
import { CalendarEvent } from '../../types/calendar';

type ItemAvailabilityModalProps = BaseModalProps & {
  item: Item;
};

const localizer = momentLocalizer(moment);
const now = new Date();

const renderableStatuses: Set<ReservationStatus> = new Set([
  'Approved',
  'Checked Out',
  'Late',
  'Pending'
] as ReservationStatus[]);

const ItemAvailabilityModal = ({
  onClose,
  visible,
  item
}: ItemAvailabilityModalProps): JSX.Element => {
  const loader = useLoader();
  const res = useReservations();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [calendarView, setCalendarView] = useState<View>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      reservations
        .filter(reservation => renderableStatuses.has(reservation.status))
        .map(reservation => ({
          start: new Date(reservation.startDateTime),
          end: new Date(reservation.endDateTime),
          title: reservation.item.name,
          resource: reservation
        })),
    [reservations]
  );

  const fetchReservations = async () => {
    loader.startLoading();

    try {
      const response = await res.getReservationsForItem(item.item);
      setReservations(response);
    } catch {
      loader.setError(true);
    }

    loader.stopLoading();
  };

  /**
   * Makes sure the calendar can't look at dates in the past
   */
  const onNavigate = (newDate: Date, view: View) => {
    // eslint-disable-next-line default-case
    switch (view) {
      case 'month':
      case 'week':
        if (newDate.getMonth() >= now.getMonth()) {
          setCalendarDate(newDate);
        }
        break;
      case 'day':
        if (newDate.getDay() >= now.getDay()) {
          setCalendarDate(newDate);
        }
        break;
    }
  };

  const onSelectEvent = (event: CalendarEvent) => {
    if (calendarView === 'month') {
      setCalendarView('day');
    }

    if (event.start) {
      setCalendarDate(event.start);
    }
  };

  const onSelectSlot = (slot: SlotInfo) => {
    const slotDate = new Date(slot.start);

    if (calendarView === 'month' && slotDate.getMonth() >= now.getMonth()) {
      setCalendarDate(slotDate);
      setCalendarView('day');
    }
  };

  const renderCalendar = () => {
    if (loader.isLoading) {
      return <LoadingSpinner text="Loading availability..." />;
    }

    if (loader.hasError) {
      return (
        <NoContent
          icon={<BsCalendarX size={84} />}
          className="availability-load-error"
          text="Error loading reservations."
          retryText="Retry"
          onRetryClick={fetchReservations}
        />
      );
    }

    return (
      <Calendar
        selectable
        onSelectSlot={onSelectSlot}
        step={15}
        onSelectEvent={onSelectEvent}
        date={calendarDate}
        onNavigate={onNavigate}
        view={calendarView}
        onView={setCalendarView}
        views={['month', 'week', 'day']}
        localizer={localizer}
        events={calendarEvents}
        className={classNames('calendar', {
          'calendar-month-view': calendarView === 'month'
        })}
      />
    );
  };

  useEffect(() => {
    if (visible) {
      fetchReservations();
    }
  }, [visible]);

  return (
    <Modal
      centered
      className="item-availability-modal"
      title={`Availability - ${item.name}`}
      visible={visible}
      onCancel={onClose}
      footer={null}
    >
      {renderCalendar()}
    </Modal>
  );
};

export default ItemAvailabilityModal;
