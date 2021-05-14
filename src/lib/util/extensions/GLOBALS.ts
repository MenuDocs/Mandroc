Array.prototype.shuffle = function() {
  return this.sort(() => Math.random() - 0.5);
};

Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.removeDuplicates = function() {
  if (Object.isFrozen(this)) {
    return [ ...new Set(this) ];
  }

  const duplicatedKeys = this.filter(key => this.filter(k => k === key).length !== 0);
  for (const key of duplicatedKeys) {
    const i = this.indexOf(key);
    this.splice(i, 1);
  }

  return this;
}

Array.prototype.format = function() {
  return this.length > 1
    ? this.map((val, idx, a) =>
      val === 0 ? idx : `, ${idx === a.length - 1 ? "**and** " : ""}${val}`
    )
      .join("")
      .trim()
    : this[0];
};

Number.random = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};
