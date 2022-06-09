
exports.seed = function(knex) {
  return Promise.all([
    knex('contents_types').insert([
      { id: 1, company_id: 1, title: "Cursos", uuid: knex.raw(`md5('1')`)},
      { id: 2, company_id: 1, title: "Esportes", uuid: knex.raw(`md5('2')`) },
      { id: 3, company_id: 2, title: "Cursos", uuid: knex.raw(`md5('3')`) },
      { id: 4, company_id: 2, title: "Finanças", uuid: knex.raw(`md5('4')`) },
    ])
  ])
};

