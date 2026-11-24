import {POINT_TYPES} from '../const.js';
import {getRandomInteger, getRandomArrayElement} from '../utils/common.js';

const CITIES = [
  'Amsterdam',
  'Geneva',
  'Chamonix',
  'Paris',
  'Berlin',
];

const DESCRIPTION_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Cras aliquet varius magna, non porta ligula feugiat eget. ' +
  'Fusce tristique felis at fermentum pharetra. ' +
  'Aliquam id orci ut lectus varius viverra. ' +
  'Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante. ' +
  'Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum. ' +
  'Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui. ' +
  'Sed sed nisi sed augue convallis suscipit in sed felis. ' +
  'Aliquam erat volutpat. ' +
  'Nunc fermentum tortor ac porta dapibus. ' +
  'In rutrum ac purus sit amet tempus.';

const DESCRIPTION_SENTENCES = DESCRIPTION_TEXT.split('. ').map((sentence) =>
  sentence.endsWith('.') ? sentence : `${sentence}.`
);

const OFFER_TITLES = [
  'Add luggage',
  'Switch to comfort',
  'Add meal',
  'Choose seats',
  'Travel by train',
  'Order Uber',
  'Rent a car',
  'Add breakfast',
  'Book tickets',
  'Lunch in city',
];

const SentenceCount = {
  MIN: 1,
  MAX: 5,
};

const PictureCount = {
  MIN: 1,
  MAX: 5,
};

const PriceRange = {
  MIN: 20,
  MAX: 600,
};

const OfferPriceRange = {
  MIN: 5,
  MAX: 200,
};

const OffersPerType = {
  MIN: 2,
  MAX: 5,
};

const PictureIndex = {
  MIN: 1,
  MAX: 5,
};

const MOCK_POINT_OFFSETS = [
  {startDays: -3, startHours: 0, startMinutes: 0, durationMinutes: 30},
  {startDays: 0, startHours: -2, startMinutes: 0, durationMinutes: 360},
  {startDays: 1, startHours: 2, startMinutes: 0, durationMinutes: 1590},
  {startDays: 3, startHours: 4, startMinutes: 15, durationMinutes: 75},
];

const EMPTY_OFFERS_TYPE = 'restaurant';
const MS_IN_MINUTE = 60 * 1000;
const MS_IN_HOUR = 60 * MS_IN_MINUTE;
const MS_IN_DAY = 24 * MS_IN_HOUR;

function createDescription() {
  const count = getRandomInteger(SentenceCount.MIN, SentenceCount.MAX);
  const sentences = Array.from({length: count}, () => getRandomArrayElement(DESCRIPTION_SENTENCES));

  return sentences.join(' ');
}

function createPicture(cityName) {
  return {
    src: `img/photos/${getRandomInteger(PictureIndex.MIN, PictureIndex.MAX)}.jpg`,
    description: `${cityName} destination photo`,
  };
}

function createDestinations() {
  return CITIES.map((city, index) => {
    const pictureCount = getRandomInteger(PictureCount.MIN, PictureCount.MAX);

    return {
      id: `destination-${index + 1}`,
      name: city,
      description: createDescription(),
      pictures: Array.from({length: pictureCount}, () => createPicture(city)),
    };
  });
}

function createOffersByType() {
  return POINT_TYPES.map((type) => {
    if (type === EMPTY_OFFERS_TYPE) {
      return {
        type,
        offers: [],
      };
    }

    const offerCount = getRandomInteger(OffersPerType.MIN, OffersPerType.MAX);
    const offers = Array.from({length: offerCount}, (_, index) => ({
      id: `${type}-offer-${index + 1}`,
      title: OFFER_TITLES[(index + POINT_TYPES.indexOf(type)) % OFFER_TITLES.length],
      price: getRandomInteger(OfferPriceRange.MIN, OfferPriceRange.MAX),
    }));

    return {
      type,
      offers,
    };
  });
}

function createPoints(destinations, offersByType) {
  return MOCK_POINT_OFFSETS.map((offset, index) => {
    const type = getRandomArrayElement(POINT_TYPES);
    const destination = getRandomArrayElement(destinations);
    const typeOffersGroup = offersByType.find((item) => item.type === type);
    const availableOffers = typeOffersGroup ? typeOffersGroup.offers : [];
    const selectedOffers = availableOffers
      .filter(() => Boolean(getRandomInteger(0, 1)))
      .map((offer) => offer.id);

    const startTimestamp =
      Date.now() +
      offset.startDays * MS_IN_DAY +
      offset.startHours * MS_IN_HOUR +
      offset.startMinutes * MS_IN_MINUTE;
    const endTimestamp = startTimestamp + offset.durationMinutes * MS_IN_MINUTE;

    return {
      id: `point-${index + 1}`,
      basePrice: getRandomInteger(PriceRange.MIN, PriceRange.MAX),
      dateFrom: new Date(startTimestamp).toISOString(),
      dateTo: new Date(endTimestamp).toISOString(),
      destination: destination.id,
      isFavorite: Boolean(getRandomInteger(0, 1)),
      offers: selectedOffers,
      type,
    };
  });
}

function getMockData() {
  const destinations = createDestinations();
  const offers = createOffersByType();
  const points = createPoints(destinations, offers);

  return {
    destinations,
    offers,
    points,
  };
}

export {getMockData};
