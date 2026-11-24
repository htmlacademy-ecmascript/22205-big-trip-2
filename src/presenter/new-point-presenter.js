import {UpdateType, UserAction} from '../const.js';
import {RenderPosition, remove, render} from '../framework/render.js';
import {isEscapeKey} from '../utils/common.js';
import PointEditView from '../view/point-edit-view.js';

export default class NewPointPresenter {
  #pointListComponent = null;
  #pointsModel = null;
  #handleDataChange = null;
  #handleDestroy = null;

  #pointEditComponent = null;

  constructor({pointListComponent, pointsModel, onDataChange, onDestroy}) {
    this.#pointListComponent = pointListComponent;
    this.#pointsModel = pointsModel;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init() {
    if (this.#pointEditComponent !== null) {
      return;
    }

    this.#pointEditComponent = new PointEditView({
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
    });

    render(this.#pointEditComponent, this.#pointListComponent.element, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeydownHandler);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#handleDestroy();
  }

  #escKeydownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };
}
