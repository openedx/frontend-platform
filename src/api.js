import camelCase from 'lodash.camelcase';
import snakeCase from 'lodash.snakecase';

export const modifyObjectKeys = (object, modify) => {
  // If the passed in object is not an Object, return it.
  if (
    object === undefined ||
    object === null ||
    (typeof object !== 'object' && !Array.isArray(object))
  ) {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map(value => modifyObjectKeys(value, modify));
  }

  // Otherwise, process all its keys.
  const result = {};
  Object.entries(object).forEach(([key, value]) => {
    result[modify(key)] = modifyObjectKeys(value, modify);
  });
  return result;
};

export const camelCaseObject = object => modifyObjectKeys(object, camelCase);

export const snakeCaseObject = object => modifyObjectKeys(object, snakeCase);

export const convertKeyNames = (object, nameMap) => {
  const transformer = key =>
    (nameMap[key] === undefined ? key : nameMap[key]);

  return modifyObjectKeys(object, transformer);
};
