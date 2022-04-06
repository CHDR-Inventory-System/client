import Papa from 'papaparse';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import { Item, Reservation, User } from '../types/API';
import API from './API';
import { formatDate } from './date';

type ReservationStatistic = {
  name: string;
  itemID: number;
  barcode: string;
  reservations: number;
  'total (minutes)': number;
  'average (minutes)': number;
  'longest (minutes)': number;
  'shortest (minutes)': number;
};

/**
 * Takes an inventory item and removes all fields that can't be parsed
 * into CSV format
 */
const itemMapper = (inventoryItem: Item) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, images, item, moveable, available, ...rest } = inventoryItem;

  rest.purchaseDate = rest.purchaseDate ? formatDate(rest.purchaseDate) : '';

  rest.barcode = String(rest.barcode);
  rest.created = formatDate(rest.created);
  rest.retiredDateTime = rest.retiredDateTime ? formatDate(rest.retiredDateTime) : '';

  // Replaces the unicode right single quotation mark character
  rest.name = rest.name.replaceAll(/\u2019/g, "'");

  rest.description = rest.description
    ? rest.description.replaceAll(/\u2019/g, "'").replaceAll('\n', ' ')
    : '';

  rest.location = rest.location ? rest.location.replaceAll(/\u2019/g, "'") : '';

  return {
    ...rest,
    movable: moveable ? 'Yes' : 'No',
    status: available ? 'Available' : 'Unavailable'
  };
};

const CSVGenerator = {
  createInventoryCSV: (items: Item[]): string => {
    const parentItems = items.map(itemMapper);
    const childItems = items.flatMap(({ children }) => children || []).map(itemMapper);

    const allItems = [...parentItems, ...childItems].sort((a, b) =>
      a.barcode.localeCompare(b.barcode)
    );

    return Papa.unparse(allItems);
  },

  generateReservationCSV: (reservations: Reservation[]): string => {
    const res = reservations.map(reservation => ({
      ID: reservation.ID,
      created: formatDate(reservation.created),
      checkout: formatDate(reservation.startDateTime),
      return: formatDate(reservation.endDateTime),
      itemName: reservation.item.name,
      email: reservation.user.email,
      status: reservation.status,
      name: reservation.user.fullName,
      approvedBy: reservation.admin?.email,
      itemID: reservation.item.ID
    }));

    return Papa.unparse(res);
  },

  generateRegisteredUsersCSV: (users: User[]): string => {
    const data = users.map(user => ({
      ...user,
      created: formatDate(user.created)
    }));

    return Papa.unparse(data);
  },

  generateUsageStatistics: async (): Promise<string> => {
    const res = await API.getAllReservations();

    // This groups each reservation by its item ID. This will return an object where
    // the keys are the ID of the item and the value is an array of reservations
    // associated with that item
    const grouped = groupBy(
      res.filter(({ status }) => status !== 'Cancelled' && status !== 'Denied'),
      'item.ID'
    );

    const stats: ReservationStatistic[] = [];

    (Object.values(grouped) as Reservation[][]).forEach(reservations => {
      const { item } = reservations[0];
      const reservationTimes = reservations.map(({ startDateTime, endDateTime }) =>
        moment(endDateTime).diff(startDateTime, 'minutes')
      );

      const totalTime = reservationTimes.reduce((prev, curr) => prev + curr, 0);
      const longestTime = Math.max(...reservationTimes);
      const shortestTime = Math.min(...reservationTimes);

      stats.push({
        name: item.name,
        itemID: item.ID,
        barcode: item.barcode,
        reservations: reservations.length,
        'total (minutes)': totalTime,
        'average (minutes)': totalTime / Math.max(reservations.length, 1),
        'longest (minutes)': Number.isSafeInteger(longestTime) ? longestTime : 0,
        'shortest (minutes)': Number.isSafeInteger(shortestTime) ? shortestTime : 0
      });
    });

    return Papa.unparse(stats);
  }
};

export default CSVGenerator;
