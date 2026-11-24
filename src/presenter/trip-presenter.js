import {FilterType, SortType, UpdateType, UserAction} from '../const.js';
import {remove, render} from '../framework/render.js';
import {filter} from '../utils/filter.js';
import {sortByDay, sortByPrice, sortByTime} from '../utils/point.js';
import SortView from '../view/sort-view.js';
import PointListView from '../view/point-list-view.js';
import NoPointView from '../view/no-point-view.js';
import PointPresenter from './point-presenter.js';
import NewPointPresenter from './new-point-presenter.js';

export default class TripPresenter {
  #tripEventsElement = null;
  #pointsModel = null;
  #filterModel = null;
  #onNewPointDestroy = null;

  #pointListComponent = new PointListView();
  #sortComponent = null;
  #noPointComponent = null;

  #pointPresenters = new Map();
  #newPointPresenter = null;
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;

  constructor({tripEventsElement, pointsModel, filterModel, onNewPointDestroy}) {
    this.#tripEventsElement = tripEventsElement;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;
    this.#onNewPointDestroy = onNewPointDestroy;

    this.#newPointPresenter = new NewPointPresenter({
      pointListComponent: this.#pointListComponent,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onDestroy: this.#handleNewPointDestroy,
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return [...filteredPoints].sort(sortByTime);
      case SortType.PRICE:
        return [...filteredPoints].sort(sortByPrice);
      default:
        return [...filteredPoints].sort(sortByDay);
    }
  }

  init() {
    this.#renderTripBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#filterModel.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);

    if (this.points.length === 0) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
      render(this.#pointListComponent, this.#tripEventsElement);
    }

    this.#newPointPresenter.init();
  }

  #renderSort() {
    this.#sortComponent = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange,
    });

    render(this.#sortComponent, this.#tripEventsElement);
  }

  #renderNoPoints() {
    this.#noPointComponent = new NoPointView({
      filterType: this.#filterType,
    });

    render(this.#noPointComponent, this.#tripEventsElement);
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointListComponent.element,
      pointsModel: this.#pointsModel,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #clearBoard({resetSortType = false} = {}) {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();

    remove(this.#sortComponent);
    this.#sortComponent = null;

    if (this.#noPointComponent) {
      remove(this.#noPointComponent);
      this.#noPointComponent = null;
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderTripBoard() {
    const points = this.points;

    if (points.length === 0) {
      remove(this.#pointListComponent);
      this.#renderNoPoints();
      return;
    }

    this.#renderSort();
    render(this.#pointListComponent, this.#tripEventsElement);
    this.#renderPoints(points);
  }

  #handleNewPointDestroy = () => {
    this.#onNewPointDestroy();

    if (this.points.length === 0 && !this.#noPointComponent) {
      remove(this.#pointListComponent);
      this.#renderNoPoints();
    }
  };

  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderTripBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderTripBoard();
        break;
    }
  };

  #handleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderTripBoard();
  };
}
