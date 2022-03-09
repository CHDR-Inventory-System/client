/* eslint-disable import/prefer-default-export */
import moment from 'moment';

export const formatDate = (date: string | number): string =>
  moment.utc(date).format('MMM D, YYYY, hh:mm A');
