function lobbyDbActions(actions, db, log) {
    actions.deleteLobby = (lobbyId, user, done) => {
        db('neoputt_lobbies')
            .where({
                id: lobbyId,
                ip: user.ip
            })
            .del()
            .then((test) => {
                console.log(test)
                return db('neoputt_peer_signals')
                    .where('lobby_id', lobbyId)
                    .del();
            })
            .asCallback(done);
    };

    actions.getLobbies = (done) => {
        db('neoputt_lobbies')
            .select(
                'ball_hit as ballHit', 'courses', 'country', 'id', 'name',
                'user_limit as userLimit', 'users'
            )
            .where('hide', false)
            .orderBy('created', 'desc')
            .asCallback(done);
    };

    actions.saveLobby = (lobby, user, done) => {
        // TODO validate courses
        db.transaction(trx => {
            return trx('neoputt_lobbies')
                .where({ ip: user.ip })
                .del()
                .then(() => {
                    return trx('neoputt_lobbies')
                        .insert({
                            'ball_hit': lobby.ballHit,
                            'turn_limit': lobby.turnLimit,
                            'user_limit': lobby.userLimit,
                            country: 'ca',
                            courses: JSON.stringify(lobby.courses),
                            created: Date.now(),
                            hide: lobby.hide,
                            ip: user.ip,
                            name: lobby.name
                        }, 'id');
                })
        })
        .asCallback((err, ids) => {
            if (err) {
                return done(err);
            }

            done(null, ids[0]);
        });
    };
}

module.exports = lobbyDbActions;
