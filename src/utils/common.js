function getRandomInteger(min, max) {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  const result = Math.random() * (upper - lower + 1) + lower;

  return Math.floor(result);
}

function getRandomArrayElement(items) {
  return items[getRandomInteger(0, items.length - 1)];
}

function isEscapeKey(evt) {
  return evt.key === 'Escape';
}

function updateItem(items, update) {
  return items.map((item) => item.id === update.id ? update : item);
}

export {getRandomInteger, getRandomArrayElement, isEscapeKey, updateItem};
