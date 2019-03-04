'use strict';

const http = require('http');
const io = require('socket.io');
const ioClient = require('socket.io-client');
const testMsg = 'HelloWorld';
const options = {
    query: {
        plate: "room1",
    }
}

let sender;
let ioServer;
let httpServer;

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {

    httpServer = http.createServer();
    ioServer = io(httpServer);    
    require('./server')(ioServer);   

    httpServer.listen(3000);
    done();
  });
  
  /**
   *  Cleanup WS & HTTP servers
   */
  afterAll((done) => {
    
    ioServer.close();
    httpServer.close();
    done();
  });

describe('Server events', function () {
    beforeEach(function (done) {
        sender = ioClient('http://localhost:3000/test', options);
        sender.on('connect', () => {
            done();
          });
    });

    afterEach(function (done) {

        // disconnect io clients after each test
        sender.disconnect()        
        done();
    });

    describe('Server Events', function () {
        test('should emit message on specific room sent on connection event.', function (done) {

            expect.assertions(1);

            ioServer.of('/test').to('room1').emit('obd', testMsg);

            sender.on('obd', function (msg) {
                expect(msg).toBe(testMsg)
                done();
            });
        });
        /**
         * Testing a custom event. In this case, an explicit ack is required on server side,
         * in order to trigger the next callback. Otherwise, the callback on the event on 
         * client side never get called.
         */
        test('should emit message on room subscribed after connection', (done) => {            
            
            expect.assertions(1);

            sender.emit('subscribe', 'room2', (ack) => {
                    ioServer.of('/test').to('room2').emit('customEvent', testMsg);
                    sender.on('customEvent', function (msg) {
                        expect(msg).toBe(testMsg)
                        done();
                    });   
            });
        });
    });
})

