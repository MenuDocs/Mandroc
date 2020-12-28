/*
 * Copyright (c) MenuDocs 2020.
 * You may not share this code outside of the MenuDocs Team unless given permission by Management.
 */

Array.prototype.shuffle = function () {
  return this.sort(() => Math.random() - 0.5);
};

Array.prototype.random = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Number.random = function (min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
