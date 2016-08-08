'strict';
/* eslint-env node, mocha, es6 */

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(chaiAsPromised);
// const expect = chai.expect;
const handler = require('./index').handler;


describe('Handler', function() {
    const event = {
        'session': {
            'sessionId': 'SessionId.BLARG',
            'application': {
                'applicationId': 'amzn1.echo-sdk-ams.app.eb4c69c2-5e93-4034-a40a-66b736fa575c'
            },
            'attributes': {},
            'user': {
                'userId': 'amzn1.ask.account.BLARG'
            },
            'new': true
        },
        'request': {
            'type': 'IntentRequest',
            'requestId': 'EdwRequestId.BLARG',
            'locale': 'en-US',
            'timestamp': '2016-08-07T02:22:55Z',
            'intent': {
                'name': 'GetNextTrainCaltrain',
                'slots': {
                    'toCaltrain': {
                        'name': 'toCaltrain',
                        'value': 'Palo alto'
                    },
                    'fromCaltrain': {
                        'name': 'fromCaltrain',
                        'value': 'San Francisco'
                    }
                }
            }
        },
        'version': '1.0'
    };

    it('tests the main handler', function(done) {
        const context = {
            fail: function() {
                console.log.apply(console, arguments);
                done();
            },
            succeed: function() {
                console.log.apply(console, arguments);
                done();
            }
        };



        handler(event, context);
    });
});
