import PointsApiService from './points-api-service.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';

const AUTHORIZATION = `Basic ${crypto.randomUUID().replaceAll('-', '')}`;
const END_POINT = 'https://22.objects.htmlacademy.pro/big-trip';

const tripMainElement = document.querySelector('.trip-main');
const tripFiltersElement = tripMainElement.querySelector('.trip-controls__filters');
const newEventButtonElement = tripMainElement.querySelector('.trip-main__event-add-btn');
const tripEventsElement = document.querySelector('.trip-events');

const pointsModel = new PointsModel({
  pointsApiService: new PointsApiService(END_POINT, AUTHORIZATION),
});
const filterModel = new FilterModel();

const tripInfoPresenter = new TripInfoPresenter({
  tripInfoContainer: tripMainElement,
  pointsModel,
});

const filterPresenter = new FilterPresenter({
  filterContainer: tripFiltersElement,
  filterModel,
  pointsModel,
});

const tripPresenter = new TripPresenter({
  tripEventsElement,
  pointsModel,
  filterModel,
  onNewPointDestroy: newPointFormCloseHandler,
});

function newEventButtonClickHandler() {
  tripPresenter.createPoint();
  newEventButtonElement.disabled = true;
}

function newPointFormCloseHandler() {
  newEventButtonElement.disabled = false;
}

newEventButtonElement.addEventListener('click', newEventButtonClickHandler);
newEventButtonElement.disabled = true;

tripInfoPresenter.init();
filterPresenter.init();
tripPresenter.init();
pointsModel.init()
  .finally(() => {
    newEventButtonElement.disabled = pointsModel.isLoadingFailed;
  });
