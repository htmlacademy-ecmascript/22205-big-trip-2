import {RenderPosition, remove, render, replace} from '../framework/render.js';
import TripInfoView from '../view/trip-info-view.js';

export default class TripInfoPresenter {
  #tripInfoContainerElement = null;
  #pointsModel = null;

  #tripInfoComponent = null;

  constructor({tripInfoContainerElement, pointsModel}) {
    this.#tripInfoContainerElement = tripInfoContainerElement;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
  }

  init() {
    const points = this.#pointsModel.points;
    const prevTripInfoComponent = this.#tripInfoComponent;

    if (points.length === 0) {
      if (prevTripInfoComponent !== null) {
        remove(prevTripInfoComponent);
        this.#tripInfoComponent = null;
      }
      return;
    }

    this.#tripInfoComponent = new TripInfoView({
      points,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
    });

    if (prevTripInfoComponent === null) {
      render(this.#tripInfoComponent, this.#tripInfoContainerElement, RenderPosition.AFTERBEGIN);
      return;
    }

    replace(this.#tripInfoComponent, prevTripInfoComponent);
    remove(prevTripInfoComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };
}
