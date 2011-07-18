function(doc) {
  if (doc._id === "config" || (doc.type === "game" && doc.players.home.length && doc.players.visitors.length && doc.league)) {
    doc._id === "config" ? emit([1, 0], doc) : emit([0, doc.end], doc);
  }
};

