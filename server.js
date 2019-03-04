'use strict';

const defaultRoom = "default";

module.exports = (io) => {

        // Callback for the connection event on the namespace
        io.of('/test').on('connection', socket => {
            socket.on('subscribe', (room, fn) => {
                var subscribeRoom = room === '' ? defaultRoom : room;
                log.info('Client ' + socket.id + 'requests to SUBSCRIBE for room: ' + subscribeRoom);

                let rooms = Object.keys(socket.rooms);

                if (subscribeRoom === defaultRoom) {
                    rooms.forEach(room => socket.leave(room));
                }

                if (rooms.includes(defaultRoom)) {
                    log.info('Client' + socket.id + 'is subscribed to default - no action');
                } else {
                    socket.join(subscribeRoom, () => {
                        rooms = Object.keys(socket.rooms);
                        log.info('Client' + socket.id + 'is subscribed in rooms: ' + rooms);
                        fn("woot");
                    });
                }
            });

            socket.on('unsubscribe', (room) => {
                var leaveRoom = room === '' ? defaultRoom : room;
                log.info('Client ' + socket.id + 'requests to UNSUBSCRIBE for room: ' + leaveRoom);
                socket.leave(leaveRoom, () => {
                    let rooms = Object.keys(socket.rooms);
                    log.info('Client' + socket.id + 'is subscribed in rooms: ' + rooms);
                });
            });

            // Callback on socket disconnection
            socket.on('disconnect', reason => {
                log.debug('Client ' + socket.id + ' disconnected');
            });
        });
}

