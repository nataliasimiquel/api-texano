
exports.seed = function(knex) {
  return knex('categories').insert([
    { id: 1, category_name: 'SUCOS', company_id: 1, status: 1},
    { id: 2, category_name: 'REFRIGERANTES', company_id: 2, status: 1}
  ]);
};
