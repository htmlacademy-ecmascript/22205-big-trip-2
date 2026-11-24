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

  constructor({currentSortType = SortType.DAY} = {}) {
    super();
    this.#currentSortType = currentSortType;
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }
}
