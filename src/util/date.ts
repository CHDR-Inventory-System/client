/* eslint-disable import/prefer-default-export */
import moment from 'moment';

type FormatOpts = {
  dateFormat?: string;
};

const defaultOptions: FormatOpts = {
  dateFormat: 'MMM D, YYYY, hh:mm A'
};

export const formatDate = (
  date: string | number,
  { dateFormat } = defaultOptions
): string => moment.utc(date).format(dateFormat);
