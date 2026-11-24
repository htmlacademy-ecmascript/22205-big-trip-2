import {SortType} from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

const SORT_ITEMS = [
  {type: SortType.DAY, label: 'Day', isDisabled: false},
  {type: SortType.EVENT, label: 'Event', isDisabled: true},
  {type: SortType.TIME, label: 'Time', isDisabled: false},
  {type: SortType.PRICE, label: 'Price', isDisabled: false},
  {type: SortType.OFFERS, label: 'Offers', isDisabled: true},
];

function createSortItemTemplate({type, label, isDisabled}, isChecked) {
  const checkedAttr = isChecked ? 'checked' : '';
  const disabledAttr = isDisabled ? 'disabled' : '';

  return (
    `<div class="trip-sort__item  trip-sort__item--${type}">
      <input
        id="sort-${type}"
        class="trip-sort__input  visually-hidden"
        type="radio"
        name="trip-sort"
        value="sort-${type}"
        data-sort-type="${type}"
        ${checkedAttr}
        ${disabledAttr}
      >
      <label class="trip-sort__btn" for="sort-${type}">${label}</label>
    </div>`
  );
}

function createSortTemplate(currentSortType) {
  const sortItemsTemplate = SORT_ITEMS
    .map((sortItem) => createSortItemTemplate(sortItem, sortItem.type === currentSortType))
    .join('');

  return (
    `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
      ${sortItemsTemplate}
    </form>`
  );
}

export default class SortView extends AbstractView {
  #currentSortType = null;
  #handleSortTypeChange = null;

  constructor({currentSortType = SortType.DAY, onSortTypeChange} = {}) {
    super();
    this.#currentSortType = currentSortType;
    this.#handleSortTypeChange = onSortTypeChange;

    this.element.addEventListener('change', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (!evt.target.dataset.sortType) {
      return;
    }

    this.#handleSortTypeChange(evt.target.dataset.sortType);
  };
}
