import * as domTypes from './types/dom'

export const convertItem = (feature: domTypes.Feature, item: globalThis.DataTransferItem) => {
  if (feature === "webkit") {
    return item.webkitGetAsEntry();
  } else {
    // @ts-ignore
    return item.getAsFileSystemHandle();
  }
};
