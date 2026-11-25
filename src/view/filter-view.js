import {FilterType} from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate({type, count}, isChecked) {
  const checkedAttribute = isChecked ? 'checked' : '';
  const disabledAttribute = count === 0 ? 'disabled' : '';
  const label = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;

  return (
    `<div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input  visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${checkedAttribute}
        ${disabledAttribute}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">${label}</label>
    </div>`
  );
}

function createFilterTemplate(filterItems, currentFilterType) {
  const filterItemsTemplate = filterItems
    .map((filterItem) => createFilterItemTemplate(filterItem, filterItem.type === currentFilterType))
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
}

export default class FilterView extends AbstractView {
  #filters = [];
  #currentFilterType = null;
  #handleFilterTypeChange = null;

  constructor({filters, currentFilterType = FilterType.EVERYTHING, onFilterTypeChange}) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.#handleFilterTypeChange = onFilterTypeChange;

    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#filters, this.#currentFilterType);
  }

  #filterTypeChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterTypeChange(evt.target.value);
  };
}
