import type { Event } from 'react-big-calendar';
import type { Reservation } from './API';

export interface CalendarEvent extends Event {
  resource: Reservation;
}
