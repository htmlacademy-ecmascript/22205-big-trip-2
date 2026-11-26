import {FilterType, UpdateType} from '../const.js';
import {remove, render, replace} from '../framework/render.js';
import {filter} from '../utils/filter.js';
import FilterView from '../view/filter-view.js';

export default class FilterPresenter {
  #filterContainerElement = null;
  #filterModel = null;
  #pointsModel = null;

  #filterComponent = null;

  constructor({filterContainerElement, filterModel, pointsModel}) {
    this.#filterContainerElement = filterContainerElement;
    this.#filterModel = filterModel;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    const points = this.#pointsModel.points;

    return Object.values(FilterType).map((type) => ({
      type,
      count: filter[type](points).length,
    }));
  }

  init() {
    const filters = this.filters;
    const previousFilterComponent = this.#filterComponent;

    this.#filterComponent = new FilterView({
      filters,
      currentFilterType: this.#filterModel.filter,
      onFilterTypeChange: this.#handleFilterTypeChange,
    });

    if (previousFilterComponent === null) {
      render(this.#filterComponent, this.#filterContainerElement);
      return;
    }

    replace(this.#filterComponent, previousFilterComponent);
    remove(previousFilterComponent);
  }

  #handleModelEvent = () => {
    this.init();
  };

  #handleFilterTypeChange = (filterType) => {
    if (this.#filterModel.filter === filterType) {
      return;
    }

    this.#filterModel.setFilter(UpdateType.MAJOR, filterType);
  };
}
