import {getMockData} from '../mock/point.js';

export default class PointsModel {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor() {
    const {points, destinations, offers} = getMockData();
    this.#points = points;
    this.#destinations = destinations;
    this.#offers = offers;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id) || null;
  }

  getOffersByType(type) {
    const foundOfferGroup = this.#offers.find((offerGroup) => offerGroup.type === type);
    return foundOfferGroup ? foundOfferGroup.offers : [];
  }
}
