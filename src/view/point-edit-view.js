import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import he from 'he';
import {POINT_TYPES, DEFAULT_TYPE} from '../const.js';
import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {formatEditDateTime} from '../utils/date.js';

import 'flatpickr/dist/flatpickr.min.css';

const FLATPICKR_DATE_FORMAT = 'd/m/y H:i';

const BLANK_POINT = {
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: DEFAULT_TYPE,
};

function createEventTypeItemTemplate(pointType, currentType, pointId, isDisabled) {
  const checkedAttribute = pointType === currentType ? 'checked' : '';
  const disabledAttribute = isDisabled ? 'disabled' : '';
  const label = `${pointType.charAt(0).toUpperCase()}${pointType.slice(1)}`;

  return (
    `<div class="event__type-item">
      <input id="event-type-${pointType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${checkedAttribute} ${disabledAttribute}>
      <label class="event__type-label  event__type-label--${pointType}" for="event-type-${pointType}-${pointId}">${label}</label>
    </div>`
  );
}

function createDestinationListTemplate(destinations, pointId) {
  const optionsMarkup = destinations
    .map((destination) => `<option value="${he.encode(destination.name)}"></option>`)
    .join('');

  return (
    `<datalist id="destination-list-${pointId}">
      ${optionsMarkup}
    </datalist>`
  );
}

function createOffersSectionTemplate(availableOffers, offerIds, pointId, isDisabled) {
  if (availableOffers.length === 0) {
    return '';
  }

  const selectedOfferIds = new Set(offerIds);
  const disabledAttribute = isDisabled ? 'disabled' : '';
  const offersMarkup = availableOffers
    .map(({id, title, price}) => {
      const checkedAttribute = selectedOfferIds.has(id) ? 'checked' : '';
      const encodedId = he.encode(id);
      const inputId = `event-offer-${encodedId}-${pointId}`;

      return (
        `<div class="event__offer-selector">
          <input
            class="event__offer-checkbox  visually-hidden"
            id="${inputId}"
            type="checkbox"
            name="event-offer-${encodedId}"
            data-offer-id="${encodedId}"
            ${checkedAttribute}
            ${disabledAttribute}
          >
          <label class="event__offer-label" for="${inputId}">
            <span class="event__offer-title">${he.encode(title)}</span>
            &plus;&euro;&nbsp;
            <span class="event__offer-price">${price}</span>
          </label>
        </div>`
      );
    })
    .join('');

  return (
    `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
        ${offersMarkup}
      </div>
    </section>`
  );
}

function createPhotosTemplate(pictures) {
  if (pictures.length === 0) {
    return '';
  }

  const photosMarkup = pictures
    .map(({src, description}) => (
      `<img class="event__photo" src="${he.encode(src)}" alt="${he.encode(description)}">`
    ))
    .join('');

  return (
    `<div class="event__photos-container">
      <div class="event__photos-tape">
        ${photosMarkup}
      </div>
    </div>`
  );
}

function createDestinationSectionTemplate(destination) {
  if (!destination) {
    return '';
  }

  const {description, pictures} = destination;

  if (!description && pictures.length === 0) {
    return '';
  }

  const descriptionMarkup = description
    ? `<p class="event__destination-description">${he.encode(description)}</p>`
    : '';
  const photosMarkup = createPhotosTemplate(pictures);

  return (
    `<section class="event__section  event__section--destination">
      <h3 class="event__section-title  event__section-title--destination">Destination</h3>
      ${descriptionMarkup}
      ${photosMarkup}
    </section>`
  );
}

function createEventTypeSelectorTemplate(type, pointId, isDisabled) {
  const disabledAttribute = isDisabled ? 'disabled' : '';
  const typeItemsTemplate = POINT_TYPES
    .map((pointType) => createEventTypeItemTemplate(pointType, type, pointId, isDisabled))
    .join('');

  return (
    `<div class="event__type-wrapper">
      <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
        <span class="visually-hidden">Choose event type</span>
        <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(type)}.png" alt="Event type icon">
      </label>
      <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox" ${disabledAttribute}>

      <div class="event__type-list">
        <fieldset class="event__type-group">
          <legend class="visually-hidden">Event type</legend>
          ${typeItemsTemplate}
        </fieldset>
      </div>
    </div>`
  );
}

function createDestinationFieldTemplate({type, destinationName, destinations, pointId, disabledAttribute}) {
  return (
    `<div class="event__field-group  event__field-group--destination">
      <label class="event__label  event__type-output" for="event-destination-${pointId}">
        ${he.encode(type)}
      </label>
      <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${pointId}" ${disabledAttribute}>
      ${createDestinationListTemplate(destinations, pointId)}
    </div>`
  );
}

function createTimeFieldTemplate({dateFrom, dateTo, pointId, disabledAttribute}) {
  return (
    `<div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
      <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" value="${formatEditDateTime(dateFrom)}" ${disabledAttribute}>
      &mdash;
      <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
      <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" value="${formatEditDateTime(dateTo)}" ${disabledAttribute}>
    </div>`
  );
}

function createPriceFieldTemplate({basePrice, pointId, disabledAttribute}) {
  return (
    `<div class="event__field-group  event__field-group--price">
      <label class="event__label" for="event-price-${pointId}">
        <span class="visually-hidden">Price</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" id="event-price-${pointId}" type="text" name="event-price" value="${basePrice}" ${disabledAttribute}>
    </div>`
  );
}

function createFormButtonsTemplate({isEditMode, isSaving, isDeleting, disabledAttribute}) {
  const saveButtonText = isSaving ? 'Saving...' : 'Save';
  const deleteButtonText = isDeleting ? 'Deleting...' : 'Delete';
  const resetButtonText = isEditMode ? deleteButtonText : 'Cancel';
  const rollupButtonTemplate = isEditMode
    ? `<button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>`
    : '';

  return (
    `<button class="event__save-btn  btn  btn--blue" type="submit" ${disabledAttribute}>${saveButtonText}</button>
    <button class="event__reset-btn" type="reset">${resetButtonText}</button>
    ${rollupButtonTemplate}`
  );
}

function createDetailsSectionTemplate({availableOffers, selectedOfferIds, currentDestination, pointId, isDisabled}) {
  const offersSectionTemplate = createOffersSectionTemplate(availableOffers, selectedOfferIds, pointId, isDisabled);
  const destinationSectionTemplate = createDestinationSectionTemplate(currentDestination);

  if (!offersSectionTemplate && !destinationSectionTemplate) {
    return '';
  }

  return (
    `<section class="event__details">
      ${offersSectionTemplate}
      ${destinationSectionTemplate}
    </section>`
  );
}

function createPointEditTemplate({state, destinations, offers}) {
  const {
    id,
    basePrice,
    dateFrom,
    dateTo,
    destination: destinationId,
    offers: selectedOfferIds,
    type,
    isDisabled,
    isSaving,
    isDeleting,
  } = state;
  const isEditMode = Boolean(id);
  const pointId = id ? he.encode(id) : 'new';
  const disabledAttribute = isDisabled ? 'disabled' : '';

  const currentDestination = destinations.find((item) => item.id === destinationId) || null;
  const typeOffersGroup = offers.find((item) => item.type === type);
  const availableOffers = typeOffersGroup ? typeOffersGroup.offers : [];
  const destinationName = currentDestination ? he.encode(currentDestination.name) : '';

  const eventTypeSelectorTemplate = createEventTypeSelectorTemplate(type, pointId, isDisabled);
  const destinationFieldTemplate = createDestinationFieldTemplate({
    type,
    destinationName,
    destinations,
    pointId,
    disabledAttribute,
  });
  const timeFieldTemplate = createTimeFieldTemplate({dateFrom, dateTo, pointId, disabledAttribute});
  const priceFieldTemplate = createPriceFieldTemplate({basePrice, pointId, disabledAttribute});
  const formButtonsTemplate = createFormButtonsTemplate({isEditMode, isSaving, isDeleting, disabledAttribute});
  const detailsTemplate = createDetailsSectionTemplate({
    availableOffers,
    selectedOfferIds,
    currentDestination,
    pointId,
    isDisabled,
  });

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${eventTypeSelectorTemplate}
          ${destinationFieldTemplate}
          ${timeFieldTemplate}
          ${priceFieldTemplate}
          ${formButtonsTemplate}
        </header>
        ${detailsTemplate}
      </form>
    </li>`
  );
}

export default class PointEditView extends AbstractStatefulView {
  #destinations = [];
  #offers = [];
  #handleFormSubmit = null;
  #handleDeleteClick = null;
  #handleRollupClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({
    point = BLANK_POINT,
    destinations = [],
    offers = [],
    onFormSubmit,
    onDeleteClick,
    onRollupClick,
  } = {}) {
    super();
    this._setState(PointEditView.parsePointToState(point));
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleDeleteClick = onDeleteClick;
    this.#handleRollupClick = onRollupClick;

    this._restoreHandlers();
  }

  get template() {
    return createPointEditTemplate({
      state: this._state,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }

  removeElement() {
    super.removeElement();

    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__reset-btn')
      .addEventListener('click', this.#deleteClickHandler);

    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#rollupClickHandler);

    this.element.querySelector('.event__type-group')
      .addEventListener('change', this.#typeChangeHandler);

    this.element.querySelector('.event__input--destination')
      .addEventListener('change', this.#destinationChangeHandler);

    this.element.querySelector('.event__available-offers')
      ?.addEventListener('change', this.#offersChangeHandler);

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInputHandler);

    this.#setDatepickers();
  }

  reset(point) {
    this.updateElement(
      PointEditView.parsePointToState(point)
    );
  }

  #setDatepickers() {
    const commonConfig = {
      enableTime: true,
      'time_24hr': true,
      dateFormat: FLATPICKR_DATE_FORMAT,
      clickOpens: !this._state.isDisabled,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('[name="event-start-time"]'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom,
        onChange: this.#dateFromChangeHandler,
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('[name="event-end-time"]'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom,
        onChange: this.#dateToChangeHandler,
      }
    );
  }

  #isValidState() {
    const hasDestination = Boolean(this._state.destination);
    const hasValidDates = Boolean(this._state.dateFrom && this._state.dateTo) &&
      !dayjs(this._state.dateTo).isBefore(dayjs(this._state.dateFrom));
    const hasValidPrice = Number.isInteger(this._state.basePrice) && this._state.basePrice > 0;

    return hasDestination && hasValidDates && hasValidPrice;
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    if (!this.#isValidState()) {
      this.shake();
      return;
    }

    this.#handleFormSubmit(PointEditView.parseStateToPoint(this._state));
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    this.#handleDeleteClick(PointEditView.parseStateToPoint(this._state));
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();

    if (this._state.isDisabled) {
      return;
    }

    this.#handleRollupClick();
  };

  #typeChangeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offers: [],
    });
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const selectedDestination = this.#destinations.find(
      (destination) => destination.name === evt.target.value
    );

    if (!selectedDestination) {
      const currentDestination = this.#destinations.find(
        (destination) => destination.id === this._state.destination
      );
      evt.target.value = currentDestination ? currentDestination.name : '';
      return;
    }

    this.updateElement({
      destination: selectedDestination.id,
    });
  };

  #offersChangeHandler = () => {
    const checkedOfferElements = Array.from(
      this.element.querySelectorAll('.event__offer-checkbox:checked')
    );

    this._setState({
      offers: checkedOfferElements.map((element) => element.dataset.offerId),
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    const sanitizedValue = evt.target.value.replace(/\D/g, '');
    evt.target.value = sanitizedValue;

    this._setState({
      basePrice: Number(sanitizedValue),
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    const updatedDateFrom = userDate ? userDate.toISOString() : null;

    if (userDate && this._state.dateTo && dayjs(userDate).isAfter(dayjs(this._state.dateTo))) {
      this._setState({
        dateFrom: updatedDateFrom,
        dateTo: updatedDateFrom,
      });
      this.#datepickerTo.setDate(userDate, false);
    } else {
      this._setState({
        dateFrom: updatedDateFrom,
      });
    }

    this.#datepickerTo.set('minDate', userDate || null);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      dateTo: userDate ? userDate.toISOString() : null,
    });
  };

  static parsePointToState(point) {
    return {
      ...point,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state) {
    const point = {...state};

    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;

    return point;
  }
}
