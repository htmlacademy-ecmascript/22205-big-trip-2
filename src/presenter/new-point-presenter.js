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
  #isPending = false;

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

    this.#isPending = false;
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

    this.#isPending = false;
    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#handleDestroy();
  }

  setSaving() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#isPending = true;
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#isPending = false;
    this.#pointEditComponent.updateElement({
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    });
    this.#pointEditComponent.shake();
  }

  #escKeydownHandler = (evt) => {
    if (this.#isPending) {
      return;
    }

    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };

  #handleFormSubmit = (point) => {
    if (this.#isPending) {
      return;
    }

    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #handleDeleteClick = () => {
    if (this.#isPending) {
      return;
    }

    this.destroy();
  };
}
