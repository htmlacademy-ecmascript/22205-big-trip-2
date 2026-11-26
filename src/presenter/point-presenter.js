import {UpdateType, UserAction} from '../const.js';
import {remove, render, replace} from '../framework/render.js';
import {isEscapeKey} from '../utils/common.js';
import PointEditView from '../view/point-edit-view.js';
import PointView from '../view/point-view.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointListContainerElement = null;
  #pointsModel = null;
  #handleDataChange = null;
  #handleModeChange = null;

  #pointComponent = null;
  #pointEditComponent = null;

  #point = null;
  #mode = Mode.DEFAULT;
  #isPending = false;

  constructor({pointListContainerElement, pointsModel, onDataChange, onModeChange}) {
    this.#pointListContainerElement = pointListContainerElement;
    this.#pointsModel = pointsModel;
    this.#handleDataChange = onDataChange;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;
    this.#isPending = false;

    const previousPointComponent = this.#pointComponent;
    const previousPointEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointView({
      point: this.#point,
      destination: this.#pointsModel.getDestinationById(this.#point.destination),
      offers: this.#pointsModel.getOffersByType(this.#point.type),
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#pointEditComponent = new PointEditView({
      point: this.#point,
      destinations: this.#pointsModel.destinations,
      offers: this.#pointsModel.offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      onRollupClick: this.#handleRollupClick,
    });

    if (previousPointComponent === null || previousPointEditComponent === null) {
      render(this.#pointComponent, this.#pointListContainerElement);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, previousPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointEditComponent, previousPointEditComponent);
    }

    remove(previousPointComponent);
    remove(previousPointEditComponent);
  }

  destroy() {
    this.#isPending = false;
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
    this.#pointComponent = null;
    this.#pointEditComponent = null;
    document.removeEventListener('keydown', this.#escKeydownHandler);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT && !this.#isPending) {
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToCard();
    }
  }

  setSaving() {
    if (this.#mode === Mode.EDITING && this.#pointEditComponent !== null) {
      this.#isPending = true;
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isSaving: true,
      });
    }
  }

  setDeleting() {
    if (this.#mode === Mode.EDITING && this.#pointEditComponent !== null) {
      this.#isPending = true;
      this.#pointEditComponent.updateElement({
        isDisabled: true,
        isDeleting: true,
      });
    }
  }

  setAborting() {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent?.shake();
      return;
    }

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

  #replaceCardToForm() {
    this.#handleModeChange();
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeydownHandler);
    this.#mode = Mode.EDITING;
  }

  #replaceFormToCard() {
    replace(this.#pointComponent, this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeydownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #escKeydownHandler = (evt) => {
    if (this.#isPending) {
      return;
    }

    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#pointEditComponent.reset(this.#point);
      this.#replaceFormToCard();
    }
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleFavoriteClick = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this.#point, isFavorite: !this.#point.isFavorite}
    );
  };

  #handleFormSubmit = (update) => {
    if (this.#isPending) {
      return;
    }

    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      update
    );
  };

  #handleDeleteClick = (point) => {
    if (this.#isPending) {
      return;
    }

    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point
    );
  };

  #handleRollupClick = () => {
    if (this.#isPending) {
      return;
    }

    this.#pointEditComponent.reset(this.#point);
    this.#replaceFormToCard();
  };
}
