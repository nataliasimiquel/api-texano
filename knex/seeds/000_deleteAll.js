exports.seed = function (knex) {
    return Promise.all([
        knex('company_profiles').del(),
        knex('losses').del(),
        knex('sales').del(),
        knex('stock').del(),
        knex('products').del(),
        knex('resources_profiles').del(),
        knex('profiles').del(),
        knex('resources').del(),
        knex('content_attributes').del(),
        knex('contents_types').del(),
        knex('companies').del(),
        knex('categories').del(),
        knex('methods').del(),
        knex('users').del(),
    ])
}