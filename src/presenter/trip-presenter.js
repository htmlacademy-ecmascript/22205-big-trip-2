import {RenderPosition, render} from '../render.js';
import TripInfoView from '../view/trip-info-view.js';
import FilterView from '../view/filter-view.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import PointEditView from '../view/point-edit-view.js';
import PointView from '../view/point-view.js';
import NewPointView from '../view/new-point-view.js';

const POINT_COUNT = 3;

export default class TripPresenter {
  #tripMainElement = null;
  #tripFiltersElement = null;
  #tripEventsElement = null;

  #pointListComponent = new PointListView();

  constructor({tripMainElement, tripFiltersElement, tripEventsElement}) {
    this.#tripMainElement = tripMainElement;
    this.#tripFiltersElement = tripFiltersElement;
    this.#tripEventsElement = tripEventsElement;
  }

  init() {
    render(new TripInfoView(), this.#tripMainElement, RenderPosition.AFTERBEGIN);
    render(new FilterView(), this.#tripFiltersElement);
    render(new SortView(), this.#tripEventsElement);
    render(this.#pointListComponent, this.#tripEventsElement);

    const pointListElement = this.#pointListComponent.getElement();

    render(new PointEditView(), pointListElement);

    for (let i = 0; i < POINT_COUNT; i++) {
      render(new PointView(), pointListElement);
    }

    render(new NewPointView(), pointListElement);
  }
}
