import Observable from '../framework/observable.js';
import {getMockData} from '../mock/point.js';

export default class PointsModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];

  constructor() {
    super();
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

  updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType, update);
  }

  addPoint(updateType, update) {
    const newPoint = {
      ...update,
      id: update.id || crypto.randomUUID(),
    };

    this.#points = [
      newPoint,
      ...this.#points,
    ];

    this._notify(updateType, newPoint);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType);
  }
}
