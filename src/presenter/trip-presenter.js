import {RenderPosition, render} from '../framework/render.js';
import {generateFilter} from '../mock/filter.js';
import {updateItem} from '../utils/common.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import NoPointView from '../view/no-point-view.js';
import PointPresenter from './point-presenter.js';

export default class TripPresenter {
  #tripMainElement = null;
  #tripFiltersElement = null;
  #tripEventsElement = null;
  #pointsModel = null;

  #pointListComponent = new PointListView();
  #noPointComponent = new NoPointView();

  #points = [];
  #pointPresenters = new Map();

  constructor({tripMainElement, tripFiltersElement, tripEventsElement, pointsModel}) {
    this.#tripMainElement = tripMainElement;
    this.#tripFiltersElement = tripFiltersElement;
    this.#tripEventsElement = tripEventsElement;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.points];

    this.#renderTripBoard();
  }

  #renderTripInfo() {
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

  #renderFilters() {
    const filters = generateFilter(this.#points);
    render(new FilterView({filters}), this.#tripFiltersElement);
  }

  #renderSort() {
    render(new SortView(), this.#tripEventsElement);
  }

  #renderNoPoints() {
    render(this.#noPointComponent, this.#tripEventsElement);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListComponent.element,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderTripBoard() {
    this.#renderFilters();

    if (this.#points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    this.#renderTripInfo();
    this.#renderSort();
    render(this.#pointListComponent, this.#tripEventsElement);
    this.#renderPoints();
  }

  #handlePointChange = (updatedPoint) => {
    this.#points = updateItem(this.#points, updatedPoint);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };

  #handleModeChange = () => {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };
}
