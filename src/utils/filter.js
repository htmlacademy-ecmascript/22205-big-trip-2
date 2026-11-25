import dayjs from 'dayjs';
import {FilterType} from '../const.js';

const filter = {
  [FilterType.EVERYTHING]: (points) => points,
  [FilterType.FUTURE]: (points) => points.filter((point) => dayjs().isBefore(dayjs(point.dateFrom))),
  [FilterType.PRESENT]: (points) => {
    const currentDate = dayjs();

    return points.filter(
      (point) => !currentDate.isBefore(dayjs(point.dateFrom)) && !currentDate.isAfter(dayjs(point.dateTo))
    );
  },
  [FilterType.PAST]: (points) => points.filter((point) => dayjs().isAfter(dayjs(point.dateTo))),
};

export {filter};
