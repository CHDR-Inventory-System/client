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
import useUser from '../../hooks/user';
import StatusFilterButton from '../reservation-calendar/StatusFilterButton';

type ItemAvailabilityModalProps = BaseModalProps & {
  item: Item;
};

const localizer = momentLocalizer(moment);
const now = new Date();
const statusColorMap: Record<ReservationStatus, string> = {
  Approved: '#3F791C',
  Cancelled: '#9E1E01',
  'Checked Out': '#791c2a',
  Denied: '#DE411E',
  Late: '#0700BC',
  Missed: '#464400',
  Pending: '#887b29',
  Returned: '#5452F6'
};

const ItemAvailabilityModal = ({
  onClose,
  visible,
  item
}: ItemAvailabilityModalProps): JSX.Element => {
  const loader = useLoader();
  const user = useUser();
  const res = useReservations();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [calendarView, setCalendarView] = useState<View>('month');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ReservationStatus>>(
    new Set<ReservationStatus>(['Approved', 'Checked Out', 'Late', 'Pending'])
  );
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      reservations
        .filter(reservation => selectedStatuses.has(reservation.status))
        .map(reservation => ({
          start: new Date(reservation.startDateTime),
          end: new Date(reservation.endDateTime),
          title: user.isAdminOrSuper()
            ? `${reservation.user.fullName} - ${reservation.item.name} [${reservation.status}]`
            : reservation.item.name,
          resource: reservation
        })),
    [reservations, selectedStatuses]
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
      case 'agenda':
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

  const onSelectStatus = (status: ReservationStatus, selected: boolean) => {
    const clone = new Set(selectedStatuses);

    if (selected) {
      clone.add(status);
    } else {
      clone.delete(status);
    }

    setSelectedStatuses(clone);
  };

  // Admins will be able to see blocked times in all colors while normal
  // users should only see blocked times in one color
  const getEventColor = (reservation: Reservation) =>
    statusColorMap[user.isAdminOrSuper() ? reservation.status : 'Checked Out'];

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
        views={
          user.isAdminOrSuper()
            ? ['month', 'week', 'day', 'agenda']
            : ['month', 'week', 'day']
        }
        localizer={localizer}
        events={calendarEvents}
        eventPropGetter={({ resource }) => ({
          style: {
            backgroundColor: getEventColor(resource)
          }
        })}
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
      {user.isAdminOrSuper() && (
        <StatusFilterButton
          className="status-filter-button"
          selectedStatuses={Array.from(selectedStatuses)}
          onSelectStatus={onSelectStatus}
        />
      )}
    </Modal>
  );
};

export default ItemAvailabilityModal;
