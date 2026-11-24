import {RenderPosition, render, replace} from '../framework/render.js';
import {isEscapeKey} from '../utils/common.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointEditView from '../view/point-edit-view.js';
import PointView from '../view/point-view.js';

export default class TripPresenter {
  #tripMainElement = null;
  #tripFiltersElement = null;
  #tripEventsElement = null;
  #pointsModel = null;

  #pointListComponent = new PointListView();
  #points = [];

  constructor({tripMainElement, tripFiltersElement, tripEventsElement, pointsModel}) {
    this.#tripMainElement = tripMainElement;
    this.#tripFiltersElement = tripFiltersElement;
    this.#tripEventsElement = tripEventsElement;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.points];

    if (this.#points.length > 0) {
      render(
        new TripInfoView({
          points: this.#points,
          destinations: this.#pointsModel.destinations,
          offers: this.#pointsModel.offers,
        }),
        this.#tripMainElement,
        RenderPosition.AFTERBEGIN
      );
    }

    render(new FilterView(), this.#tripFiltersElement);
    render(new SortView(), this.#tripEventsElement);
    render(this.#pointListComponent, this.#tripEventsElement);

    this.#renderPoints();
  }

  #renderPoints() {
    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const escKeydownHandler = (evt) => {
      if (isEscapeKey(evt)) {
        evt.preventDefault();
        replaceFormToCard();
      }
    };

    const pointComponent = new PointView({
      point,
      destination: this.#pointsModel.getDestinationById(point.destination),
      offers: this.#pointsModel.getOffersByType(point.type),
      onEditClick: () => {
        replaceCardToForm();
      },
    });

    const pointEditComponent = new PointEditView({
      point,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
      onFormSubmit: () => {
        replaceFormToCard();
      },
      onRollupClick: () => {
        replaceFormToCard();
      },
    });

    function replaceCardToForm() {
      replace(pointEditComponent, pointComponent);
      document.addEventListener('keydown', escKeydownHandler);
    }

    function replaceFormToCard() {
      replace(pointComponent, pointEditComponent);
      document.removeEventListener('keydown', escKeydownHandler);
    }

    render(pointComponent, this.#pointListComponent.element);
  }
}
