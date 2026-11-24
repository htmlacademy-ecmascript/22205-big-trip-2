import he from 'he';
import {POINT_TYPES, DEFAULT_TYPE} from '../const.js';
import AbstractView from '../framework/view/abstract-view.js';
import {formatEditDateTime} from '../utils/date.js';

const BLANK_POINT = {
  basePrice: 0,
  dateFrom: null,
  dateTo: null,
  destination: null,
  isFavorite: false,
  offers: [],
  type: DEFAULT_TYPE,
};

function createEventTypeItemTemplate(pointType, currentType, pointId) {
  const checkedAttr = pointType === currentType ? 'checked' : '';
  const label = `${pointType.charAt(0).toUpperCase()}${pointType.slice(1)}`;

  return (
    `<div class="event__type-item">
      <input id="event-type-${pointType}-${pointId}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${pointType}" ${checkedAttr}>
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

function createOffersSectionTemplate(availableOffers, selectedOfferIds, pointId) {
  if (availableOffers.length === 0) {
    return '';
  }

  const selectedOfferIdSet = new Set(selectedOfferIds);
  const offersMarkup = availableOffers
    .map(({id, title, price}) => {
      const checkedAttr = selectedOfferIdSet.has(id) ? 'checked' : '';
      const inputId = `event-offer-${he.encode(id)}-${pointId}`;

      return (
        `<div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="${inputId}" type="checkbox" name="event-offer-${he.encode(id)}" ${checkedAttr}>
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

function createPointEditTemplate({point, destinations, offers}) {
  const {id, basePrice, dateFrom, dateTo, destination: destinationId, offers: selectedOfferIds, type} = point;
  const isEditMode = Boolean(id);
  const pointId = id || 'new';

  const currentDestination = destinations.find((item) => item.id === destinationId) || null;
  const typeOffersGroup = offers.find((item) => item.type === type);
  const availableOffers = typeOffersGroup ? typeOffersGroup.offers : [];

  const typeItemsTemplate = POINT_TYPES
    .map((pointType) => createEventTypeItemTemplate(pointType, type, pointId))
    .join('');
  const destinationName = currentDestination ? he.encode(currentDestination.name) : '';
  const resetButtonText = isEditMode ? 'Delete' : 'Cancel';
  const rollupButtonTemplate = isEditMode
    ? `<button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>`
    : '';

  const offersSectionTemplate = createOffersSectionTemplate(availableOffers, selectedOfferIds, pointId);
  const destinationSectionTemplate = createDestinationSectionTemplate(currentDestination);
  const detailsTemplate = offersSectionTemplate || destinationSectionTemplate
    ? `<section class="event__details">
        ${offersSectionTemplate}
        ${destinationSectionTemplate}
      </section>`
    : '';

  return (
    `<li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${pointId}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${he.encode(type)}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${pointId}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${typeItemsTemplate}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-${pointId}">
              ${he.encode(type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${pointId}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${pointId}">
            ${createDestinationListTemplate(destinations, pointId)}
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${pointId}" type="text" name="event-start-time" value="${formatEditDateTime(dateFrom)}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${pointId}" type="text" name="event-end-time" value="${formatEditDateTime(dateTo)}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${pointId}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${pointId}" type="text" name="event-price" value="${basePrice}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${resetButtonText}</button>
          ${rollupButtonTemplate}
        </header>
        ${detailsTemplate}
      </form>
    </li>`
  );
}

export default class PointEditView extends AbstractView {
  #point = null;
  #destinations = [];
  #offers = [];
  #handleFormSubmit = null;
  #handleRollupClick = null;

  constructor({point = BLANK_POINT, destinations = [], offers = [], onFormSubmit, onRollupClick} = {}) {
    super();
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollupClick = onRollupClick;

    this.element.querySelector('form')
      .addEventListener('submit', this.#formSubmitHandler);

    this.element.querySelector('.event__rollup-btn')
      ?.addEventListener('click', this.#rollupClickHandler);
  }

  get template() {
    return createPointEditTemplate({
      point: this.#point,
      destinations: this.#destinations,
      offers: this.#offers,
    });
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };
}
