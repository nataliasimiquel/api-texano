
exports.seed = function(knex) {
  return knex('companies').insert([
    {id: 1, cnpj: "28013875000147", name: "Coalah"},
    {id: 2, cnpj: "19395982000196", name: "Lucas"},
  ]);
};
