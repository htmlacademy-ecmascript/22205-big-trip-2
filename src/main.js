import TripPresenter from './presenter/trip-presenter.js';

const tripMainElement = document.querySelector('.trip-main');
const tripFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
const tripEventsElement = document.querySelector('.trip-events');

const tripPresenter = new TripPresenter({
  tripMainElement,
  tripFiltersElement,
  tripEventsElement,
});

tripPresenter.init();
