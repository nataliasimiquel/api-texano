
exports.seed = function(knex) {
  return knex('methods').insert([
    { id: 1, type: "DINHEIRO"},
    { id: 2, type: "CRÉDITO"},
    { id: 3, type: "DÉBITO"},
    { id: 4, type: "PIX"},
  ]);
};
