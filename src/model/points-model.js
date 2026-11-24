import {UpdateType} from '../const.js';
import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #pointsApiService = null;
  #points = [];
  #destinations = [];
  #offers = [];
  #isLoadingFailed = false;

  constructor({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
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

  get isLoadingFailed() {
    return this.#isLoadingFailed;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#pointsApiService.points,
        this.#pointsApiService.destinations,
        this.#pointsApiService.offers,
      ]);

      this.#points = points.map(this.#adaptToClient);
      this.#destinations = destinations;
      this.#offers = offers;
      this.#isLoadingFailed = false;
    } catch (err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      this.#isLoadingFailed = true;
    }

    this._notify(UpdateType.INIT);
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id) || null;
  }

  getOffersByType(type) {
    const foundOfferGroup = this.#offers.find((offerGroup) => offerGroup.type === type);
    return foundOfferGroup ? foundOfferGroup.offers : [];
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, updatedPoint);
    } catch (err) {
      throw new Error('Can\'t update point');
    }
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

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      isFavorite: point['is_favorite'],
    };

    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];

    return adaptedPoint;
  }
}
