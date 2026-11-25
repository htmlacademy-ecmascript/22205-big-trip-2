import he from 'he';
import AbstractView from '../framework/view/abstract-view.js';
import {humanizeTripInfoDate} from '../utils/date.js';
import {sortByDay} from '../utils/point.js';

const MAX_DISPLAYED_CITIES = 3;

function getTripTitle(sortedPoints, destinationById) {
  const cityNames = sortedPoints
    .map((point) => destinationById.get(point.destination))
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
  const offerPricesByType = new Map(
    offersByType.map(({type, offers}) => [
      type,
      new Map(offers.map((offer) => [offer.id, offer.price])),
    ])
  );

  return points.reduce((total, point) => {
    const offerPrices = offerPricesByType.get(point.type);
    const offersCost = point.offers.reduce(
      (sum, offerId) => sum + (offerPrices?.get(offerId) ?? 0),
      0
    );

    return total + point.basePrice + offersCost;
  }, 0);
}

function createTripInfoTemplate({points, destinations, offers}) {
  const sortedPoints = [...points].sort(sortByDay);
  const destinationById = new Map(destinations.map((destination) => [destination.id, destination.name]));

  const title = getTripTitle(sortedPoints, destinationById);
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

export default class TripInfoView extends AbstractView {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor({points, destinations, offers}) {
    super();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get template() {
    return createTripInfoTemplate({
      points: this.#points,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }
}
