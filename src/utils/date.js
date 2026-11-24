import dayjs from 'dayjs';

const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const MINUTES_IN_DAY = MINUTES_IN_HOUR * HOURS_IN_DAY;
const PAD_LENGTH = 2;

const DateFormat = {
  POINT_DATE: 'MMM D',
  POINT_DATE_ATTR: 'YYYY-MM-DD',
  POINT_TIME: 'HH:mm',
  POINT_DATETIME_ATTR: 'YYYY-MM-DDTHH:mm',
  EDIT_DATETIME: 'DD/MM/YY HH:mm',
  TRIP_INFO_DATE: 'D MMM',
};

function padWithZero(value) {
  return String(value).padStart(PAD_LENGTH, '0');
}

function humanizePointDate(date) {
  return date ? dayjs(date).format(DateFormat.POINT_DATE) : '';
}

function formatPointDateAttr(date) {
  return date ? dayjs(date).format(DateFormat.POINT_DATE_ATTR) : '';
}

function humanizePointTime(date) {
  return date ? dayjs(date).format(DateFormat.POINT_TIME) : '';
}

function formatPointDateTimeAttr(date) {
  return date ? dayjs(date).format(DateFormat.POINT_DATETIME_ATTR) : '';
}

function formatEditDateTime(date) {
  return date ? dayjs(date).format(DateFormat.EDIT_DATETIME) : '';
}

function humanizeTripInfoDate(date) {
  return date ? dayjs(date).format(DateFormat.TRIP_INFO_DATE) : '';
}

function getPointDuration(dateFrom, dateTo) {
  const totalMinutes = dayjs(dateTo).diff(dayjs(dateFrom), 'minute');
  const days = Math.floor(totalMinutes / MINUTES_IN_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_IN_DAY) / MINUTES_IN_HOUR);
  const minutes = totalMinutes % MINUTES_IN_HOUR;

  if (days > 0) {
    return `${padWithZero(days)}D ${padWithZero(hours)}H ${padWithZero(minutes)}M`;
  }

  if (hours > 0) {
    return `${padWithZero(hours)}H ${padWithZero(minutes)}M`;
  }

  return `${padWithZero(minutes)}M`;
}

export {
  humanizePointDate,
  formatPointDateAttr,
  humanizePointTime,
  formatPointDateTimeAttr,
  formatEditDateTime,
  humanizeTripInfoDate,
  getPointDuration,
};
