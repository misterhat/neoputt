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
            table.json('courses').notNull();
            table.string('country', 2);
            table.string('ip').unique().notNull().index();
            table.string('name', config.maxNameLength).notNull();
            table.timestamp('created').notNull().defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('neoputt_peer_signals', table => {
            table.increments('id').unsigned().primary();
            table.integer('lobby_id').unsigned().references('id')
                .inTable('neoputt_lobbies').index();
            table.json('answer');
            table.json('answer_candidates');
            table.json('offer').notNull();
            table.json('offer_candidates');
            table.string('offer_hash', 40).notNull().index();
        })
    ]);
};

exports.down = function (knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('neoputt_course_reactions'),
        knex.schema.dropTableIfExists('neoputt_courses'),
        knex.schema.dropTableIfExists('neoputt_lobbies')
    ]);
};
