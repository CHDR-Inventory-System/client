/* eslint-disable import/prefer-default-export */
import moment from 'moment';

// The server returns GMT dates so we need to add 5 hours to convert it to EST
export const formatDate = (date: string | number): string =>
  moment(date).add({ hours: 5 }).format('MMM D, YYYY, hh:mm A');
