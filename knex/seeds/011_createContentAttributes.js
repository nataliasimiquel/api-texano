
exports.seed = function(knex) {
  return knex('content_attributes').insert([
    { id: 1, contents_types_id: 1, title: "title" },
    { id: 2, contents_types_id: 1, title: "image"},
    { id: 3, contents_types_id: 1, title: "text" },

    { id: 4, contents_types_id: 2, title: "title" },
    { id: 5, contents_types_id: 2, title: "image"},
    { id: 6, contents_types_id: 2, title: "text" },

    { id: 7, contents_types_id: 3, title: "title" },
    { id: 8, contents_types_id: 3, title: "image"},
    { id: 9, contents_types_id: 3, title: "text" },

    { id: 10, contents_types_id: 4, title: "title" },
    { id: 11, contents_types_id: 4, title: "image"},
    { id: 12, contents_types_id: 4, title: "text" },
  ]);
};
