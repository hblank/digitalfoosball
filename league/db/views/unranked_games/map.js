function(doc) {
  if (doc.type === "game" && doc.players.home.length && doc.players.visitors.length && !doc.league) {
    emit(doc.end, doc);
  }
};

