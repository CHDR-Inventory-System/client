import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../scss/reservation-calendar.scss';
import '../scss/react-big-calendar-overrides.scss';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import debounce from 'lodash/debounce';
import moment from 'moment';
import { BiExitFullscreen, BiFullscreen } from 'react-icons/bi';
import { Button, notification } from 'antd';
import { BsCalendarX } from 'react-icons/bs';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import useUser from '../hooks/user';
import PageNotFound from '../components/PageNotFound';
import { Reservation, ReservationStatus } from '../types/API';
import useLoader from '../hooks/loading';
import useReservations from '../hooks/reservation';
import LoadingSpinner from '../components/LoadingSpinner';
import NoContent from '../components/dashboard/NoContent';
import UpdateReservationModal from '../components/modals/UpdateReservationModal';
import useModal from '../hooks/modal';
import type { CalendarEvent } from '../types/calendar';
import HideInactive from '../components/HideInactive';
import useRefWithCallback from '../hooks/ref-with-callback';
import StatusFilterButton from '../components/reservation-calendar/StatusFilterButton';

const now = new Date();
const localizer = momentLocalizer(moment);
const defaultNavbarHeight = 82;
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

const ReservationCalendar = (): JSX.Element => {
  const user = useUser();
  const loader = useLoader();
  const reservationModal = useModal();
  const reservation = useReservations();
  const [selectedStatuses, setSelectedStatuses] = useState<Set<ReservationStatus>>(
    new Set<ReservationStatus>(['Approved', 'Checked Out', 'Late', 'Pending'])
  );
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendarView, setCalendarView] = useState<View>(
    () => (searchParams.get('view') || 'month') as View
  );
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [hasError, setHasError] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    null
  );
  const [calendarHeight, setCalendarHeight] = useState(
    window.innerHeight - defaultNavbarHeight
  );
  const calendarEvents: CalendarEvent[] = useMemo(
    () =>
      reservation.state
        .filter(res => selectedStatuses.has(res.status as ReservationStatus))
        .map(res => ({
          start: new Date(res.startDateTime),
          end: new Date(res.endDateTime),
          title: `${res.user.fullName} - ${res.item.name} [${res.status}]`,
          resource: res as Reservation
        })),
    [reservation.state, selectedStatuses]
  );

  const [calendarContainerElement, setCalendarRef] = useRefWithCallback<HTMLDivElement>(
    element => element.addEventListener('fullscreenchange', onCalendarFullscreenChange),
    element => element.removeEventListener('fullscreenchange', onCalendarFullscreenChange)
  );

  const calculateCalendarHeight = () => {
    const navbar = document.querySelector<HTMLDivElement>('.navbar');

    if (!navbar) {
      return;
    }

    setCalendarHeight(
      document.fullscreenElement
        ? window.innerHeight
        : window.innerHeight - navbar.clientHeight
    );
  };

  const onWindowResize = debounce(calculateCalendarHeight, 500);

  const onCalendarFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsFullScreen(false);
    }
  };

  const onSelectEvent = (event: CalendarEvent) => {
    setSelectedReservation(event.resource);
    reservationModal.open();
  };

  const loadAllReservations = async () => {
    loader.startLoading();
    setHasError(false);

    try {
      await reservation.initAllReservations();
    } catch {
      notification.error({
        message: 'Error Loading Reservations',
        description: `
          An error occurred while loading reservations,
          refresh the page to try again.
          `
      });
    }

    loader.stopLoading();
  };

  const enterFullScreen = () => {
    const element = calendarContainerElement.current;

    if (!element) {
      return;
    }

    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    }
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen?.();
    } else if (document.mozFullScreenElement) {
      document.mozCancelFullScreen?.();
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

  useLayoutEffect(() => calculateCalendarHeight(), []);

  useEffect(() => {
    if (!user.isAdminOrSuper()) {
      return () => {};
    }

    document.title = 'CHDR Inventory - Calendar';

    loadAllReservations();
    window.addEventListener('resize', onWindowResize);

    return () => {
      notification.destroy();
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  useEffect(() => {
    if (isFullScreen) {
      enterFullScreen();
    } else {
      exitFullScreen();
    }
  }, [isFullScreen]);

  useEffect(() => {
    if (user.isAdminOrSuper()) {
      setSearchParams({ view: calendarView }, { replace: true });
    }
  }, [calendarView]);

  if (!user.isAdminOrSuper()) {
    return <PageNotFound />;
  }

  if (loader.isLoading) {
    return (
      <div className="reservation-calendar">
        <Navbar />
        <LoadingSpinner text="Loading Calendar..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="reservation-calendar">
        <Navbar />
        <NoContent
          icon={<BsCalendarX size={84} />}
          className="reservation-load-error"
          text="Error loading reservations."
        />
      </div>
    );
  }

  return (
    <div className="reservation-calendar">
      <Navbar />
      {selectedReservation && (
        <UpdateReservationModal
          visible={reservationModal.isVisible}
          reservation={selectedReservation}
          onClose={reservationModal.close}
        />
      )}
      <div className="calendar-container" ref={setCalendarRef}>
        <Calendar
          selectable
          onSelectSlot={onSelectSlot}
          step={15}
          defaultView={calendarView}
          view={calendarView}
          onView={setCalendarView}
          localizer={localizer}
          events={calendarEvents}
          date={calendarDate}
          onNavigate={newDate => setCalendarDate(newDate)}
          className="calendar"
          onSelectEvent={onSelectEvent}
          style={{ height: calendarHeight }}
          eventPropGetter={({ resource }) => ({
            style: { backgroundColor: statusColorMap[resource.status] }
          })}
        />
        <HideInactive timeout={1500} enabled={isFullScreen}>
          <div className="actions">
            {!isFullScreen && (
              <StatusFilterButton
                className="action"
                selectedStatuses={Array.from(selectedStatuses)}
                onSelectStatus={onSelectStatus}
              />
            )}
            <Button
              type="primary"
              className="action"
              title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              onClick={() => setIsFullScreen(!isFullScreen)}
              icon={isFullScreen ? <BiExitFullscreen /> : <BiFullscreen />}
            />
          </div>
        </HideInactive>
      </div>
    </div>
  );
};

export default ReservationCalendar;
