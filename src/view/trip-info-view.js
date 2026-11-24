import dayjs from 'dayjs';
import he from 'he';
import {createElement} from '../render.js';
import {humanizeTripInfoDate} from '../utils/date.js';

const MAX_DISPLAYED_CITIES = 3;

function getTripTitle(sortedPoints, destinationMap) {
  const cityNames = sortedPoints
    .map((point) => destinationMap.get(point.destination))
    .filter(Boolean);

  if (cityNames.length === 0) {
    return '';
  }

  if (cityNames.length > MAX_DISPLAYED_CITIES) {
    return `${he.encode(cityNames[0])} &mdash;... &mdash; ${he.encode(cityNames[cityNames.length - 1])}`;
  }

  return cityNames.map((city) => he.encode(city)).join(' &mdash; ');
}

function getTripDates(sortedPoints) {
  if (sortedPoints.length === 0) {
    return '';
  }

  const startDate = humanizeTripInfoDate(sortedPoints[0].dateFrom);
  const endDate = humanizeTripInfoDate(sortedPoints[sortedPoints.length - 1].dateTo);

  return `${startDate}&nbsp;&mdash;&nbsp;${endDate}`;
}

function getTotalCost(points, offersByType) {
  const offersByTypeMap = new Map(
    offersByType.map(({type, offers}) => [
      type,
      new Map(offers.map((offer) => [offer.id, offer.price])),
    ])
  );

  return points.reduce((total, point) => {
    const typeOfferPrices = offersByTypeMap.get(point.type);
    const offersCost = point.offers.reduce(
      (sum, offerId) => sum + (typeOfferPrices?.get(offerId) ?? 0),
      0
    );

    return total + point.basePrice + offersCost;
  }, 0);
}

function createTripInfoTemplate({points, destinations, offers}) {
  const sortedPoints = [...points].sort((pointA, pointB) =>
    dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom))
  );
  const destinationMap = new Map(destinations.map((destination) => [destination.id, destination.name]));

  const title = getTripTitle(sortedPoints, destinationMap);
  const dates = getTripDates(sortedPoints);
  const totalCost = getTotalCost(points, offers);

  return (
    `<section class="trip-main__trip-info  trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${title}</h1>

        <p class="trip-info__dates">${dates}</p>
      </div>

      <p class="trip-info__cost">
        Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
      </p>
    </section>`
  );
}

export default class TripInfoView {
  #element = null;
  #points = [];
  #destinations = [];
  #offers = [];

  constructor({points, destinations, offers}) {
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  getTemplate() {
    return createTripInfoTemplate({
      points: this.#points,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }

  getElement() {
    if (!this.#element) {
      this.#element = createElement(this.getTemplate());
    }

    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }
}
