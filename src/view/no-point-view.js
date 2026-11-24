import {FilterType} from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';

const LOAD_ERROR_TEXT = 'Failed to load latest route information';

const NoPointsTextType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.PAST]: 'There are no past events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.FUTURE]: 'There are no future events now',
};

function createNoPointTemplate(filterType, isLoadError) {
  const noPointTextValue = isLoadError ? LOAD_ERROR_TEXT : NoPointsTextType[filterType];

  return `<p class="trip-events__msg">${noPointTextValue}</p>`;
}

export default class NoPointView extends AbstractView {
  #filterType = null;
  #isLoadError = false;

  constructor({filterType = FilterType.EVERYTHING, isLoadError = false} = {}) {
    super();
    this.#filterType = filterType;
    this.#isLoadError = isLoadError;
  }

  get template() {
    return createNoPointTemplate(this.#filterType, this.#isLoadError);
  }
}
