
exports.seed = function(knex) {
  return knex('company_profiles').insert([
    {
      id: 1, 
      profile_id: 1,
      user_id: 1,
      company_id: 1,
    },
  ]);
};
