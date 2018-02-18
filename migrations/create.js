// http://knexjs.org/#Migrations-API

const config = require('../config');

exports.up = (knex, Promise) => {
    return Promise.all([
        knex.schema.createTable('neoputt_courses', table => {
            table.increments('id').unsigned().primary();
            table.integer('dislikes').notNull().defaultTo(0);
            table.integer('likes').notNull().defaultTo(0);
            table.json('course').notNull();
            table.string('ip').notNull();
            table.string('name', config.maxNameLength).unique().notNull();
            table.string('user_agent');
            table.timestamp('created').notNull().defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('neoputt_course_ratings', table => {
            table.increments('id').unsigned().primary();
            table.integer('course_id').unsigned().references('id').
                inTable('neoputt_courses').index();
            table.boolean('is_dislike').defaultTo(false);
            table.string('ip').notNull();
            table.timestamp('when').notNull().defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('neoputt_course_words', table => {
            table.increments('id').unsigned().primary();
            table.integer('course_id').unsigned().references('id').
                inTable('neoputt_courses').index();
            table.string('word', config.maxNameLength).notNull();
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('neoputt_courses'),
        knex.schema.dropTableIfExists('neoputt_course_ratings'),
        knex.schema.dropTableIfExists('neoputt_course_words')
    ]);
};
