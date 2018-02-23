// http://knexjs.org/#Migrations-API

const config = require('../config');

exports.up = (knex, Promise) => {
    return Promise.all([
        knex.schema.createTable('neoputt_courses', table => {
            table.increments('id').unsigned().primary();
            table.integer('dislikes').notNull().defaultTo(0);
            table.integer('likes').notNull().defaultTo(0);
            table.json('course').notNull();
            table.string('entity_hash', 40).notNull();
            table.string('ip').notNull();
            table.string('name', config.maxNameLength).unique().notNull();
            table.string('tile_hash', 40).notNull();
            table.string('user_agent');
            table.timestamp('created').notNull().defaultTo(knex.fn.now());
            table.index([ 'entity_hash', 'tile_hash' ], 'course_hashes');
        }),
        knex.schema.createTable('neoputt_course_reactions', table => {
            table.increments('id').unsigned().primary();
            table.integer('course_id').unsigned().references('id')
                .inTable('neoputt_courses').index();
            table.string('ip').notNull();
            table.timestamp('when').notNull().defaultTo(knex.fn.now());
            table.tinyint('reaction').unsigned();
        }),
        knex.schema.createTable('neoputt_lobbies', table => {
            table.increments('id').unsigned().primary();
            table.boolean('ball_hit').defaultTo(true);
            table.boolean('hide').defaultTo(false);
            table.integer('turn_limit').notNull().defaultTo(config.turnLimit);
            table.integer('user_limit').notNull().defaultTo(
                config.maxLobbyUsers);
            table.integer('users').notNull().defaultTo(1);
            table.string('country', 2);
            table.string('ip').unique().notNull();
            table.string('name', config.maxNameLength).notNull();
            table.string('peer_signal').notNull();
            table.timestamp('created').notNull().defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('neoputt_lobby_courses', table => {
            table.increments('id').unsigned().primary();
            table.string('course_name', config.maxNameLength).notNull();
            table.integer('lobby_id').unsigned().references('id')
                .inTable('neoputt_lobbies').index();
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('neoputt_course_reactions'),
        knex.schema.dropTableIfExists('neoputt_courses'),
        knex.schema.dropTableIfExists('neoputt_lobbies'),
        knex.schema.dropTableIfExists('neoputt_lobby_courses')
    ]);
};
