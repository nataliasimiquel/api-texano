
exports.seed = function(knex) {
  return knex('products').insert([
    { id: 1, name: 'SUCO DE LARANJA', price: 8.50, company_id: 1, status: 1},
    { id: 2, name: 'SUCO DE MARACUJA', price: 8.00, company_id: 1, status: 1},
    { id: 3, name: 'COCA-COLA', price: 5.00, company_id: 2, status: 1},
    { id: 4, name: 'GUARANÁ', price: 5.00, company_id: 2, status: 1},
  ]);
};

