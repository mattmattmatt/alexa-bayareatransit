'strict';
/* eslint-env node, mocha, es6 */

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(chaiAsPromised);
const expect = chai.expect;
const intents = require('./intents');


describe('Intents', function() {
    var def;
    var resp;

    beforeEach(function() {
        def = {
            intent: {
                slots: {
                    from: {},
                    to: {},
                    delta: {},
                    count: {}
                }
            },
            ses: {},
            cb: function() {}
        };
        resp = {
            outputSpeech: {
                type: 'PlainText',
                text: undefined
            },
            reprompt: {
                outputSpeech: {
                    type: 'PlainText',
                    text: undefined
                }
            },
            shouldEndSession: undefined
        };
    });

    function responseObjectCheck(done, isDone) {
        return function(sessionAttributes, response) {
            response.outputSpeech.text = undefined;
            response.reprompt.outputSpeech.text = undefined;
            response.shouldEndSession = undefined;
            expect(sessionAttributes).to.be.an('object').and.to.eql({});
            expect(response).to.be.an('object').and.to.eql(resp);
            if (isDone) {
                done();
            }
        };
    }

    describe('getNextTrain', function() {
        const fn = intents.getNextTrain;

        it('builds a valid callback response object', function(done) {
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'Bumm';
            def.intent.slots.to.value = 'Bamm';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done, true));
        });

        it('returns a successful train for two stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns an error message for no stops', function() {
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your departure stop. Where do you want to go?');
        });
        it('returns an error message for one stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your destination. Where do you want to go?');
        });
        it('returns an error message for wrong stops', function() {
            def.intent.slots.from.value = 'Butter';
            def.intent.slots.to.value = 'Johnathan';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t find a train from Butter to Johnathan. Where do you want to go?');
        });
    });

    describe('getNextTrainFuture', function() {
        const fn = intents.getNextTrainFuture;

        it('builds a valid callback response object', function(done) {
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'Bumm';
            def.intent.slots.to.value = 'Bamm';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.delta.value = 'appletree';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.delta.value = 'PT50M';
            fn(def.intent, def.ses, responseObjectCheck(done, true));
        });

        it('returns a successful train for two stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful train for two stops and a future date', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.delta.value = 'PT60M';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train [\w ]+ from now will take [\w ]+ from [\w ]+ to [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful train for two stops and a past date', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.delta.value = 'PT-800M';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train [\w ]+ ago will take [\w ]+ from [\w ]+ to [\w ]+ and left [\w ]+\ ago. /);
        });

        it('returns a successful train for two stops and an invalid date', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.delta.value = 'appletree';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns an error message for no stops', function() {
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your departure stop. Where do you want to go?');
        });
        it('returns an error message for one stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your destination. Where do you want to go?');
        });
        it('returns an error message for wrong stops', function() {
            def.intent.slots.from.value = 'Butter';
            def.intent.slots.to.value = 'Johnathan';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t find a train from Butter to Johnathan. Where do you want to go?');
        });
    });

    describe('getNextTrains', function() {
        const fn = intents.getNextTrains;

        it('builds a valid callback response object', function(done) {
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'Bumm';
            def.intent.slots.to.value = 'Bamm';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 'twenty';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 10;
            fn(def.intent, def.ses, responseObjectCheck(done, true));
        });

        it('returns a successful train for two stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful train for two stops and count 1', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful result for two stops and 2 trips', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 2;
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next 2 trains from [\w ]+ to [\w ]+: Travelling for [\w ]+, leaving in [\w ]+. Travelling for [\w ]+, leaving in [\w ]+. Have a great trip!/);
        });

        it('returns a successful train for two stops and an invalid count', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 'appletree';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns an error message for no stops', function() {
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your departure stop. Where do you want to go?');
        });
        it('returns an error message for one stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your destination. Where do you want to go?');
        });
        it('returns an error message for wrong stops', function() {
            def.intent.slots.from.value = 'Butter';
            def.intent.slots.to.value = 'Johnathan';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t find a train from Butter to Johnathan. Where do you want to go?');
        });
    });

    describe('getNextTrainsFuture', function() {
        const fn = intents.getNextTrainsFuture;

        it('builds a valid callback response object', function(done) {
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'Bumm';
            def.intent.slots.to.value = 'Bamm';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 'twenty';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            def.intent.slots.delta.value = 'PT50M';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            def.intent.slots.delta.value = 'appletree';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 10;
            def.intent.slots.delta.value = 'appletree';
            fn(def.intent, def.ses, responseObjectCheck(done));

            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 10;
            def.intent.slots.delta.value = 'PT50M';
            fn(def.intent, def.ses, responseObjectCheck(done, true));
        });

        it('returns a successful train for two stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful train for two stops and count 1', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 1;
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns a successful result for two stops and 2 trips', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 2;
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next 2 trains from [\w ]+ to [\w ]+: Travelling for [\w ]+, leaving in [\w ]+. Travelling for [\w ]+, leaving in [\w ]+. Have a great trip!/);
        });

        it('returns a successful result for two stops and 2 trips in the future', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 2;
            def.intent.slots.delta.value = 'PT5H';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next 2 trains from [\w ]+ to [\w ]+, starting in [\w ]+: Travelling for [\w ]+, leaving in [\w ]+. Travelling for [\w ]+, leaving in [\w ]+. Have a great trip!/);
        });

        it('returns a successful result for two stops and 2 trips in the past', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 2;
            def.intent.slots.delta.value = 'PT-50H';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next 2 trains from [\w ]+ to [\w ]+, starting [\w ]+ ago: Travelling for [\w ]+, left [\w ]+ ago. Travelling for [\w ]+, left [\w ]+ ago. Have a great trip!/);
        });

        it('returns a successful train for two stops and an invalid count', function() {
            def.intent.slots.from.value = 'San Francisco';
            def.intent.slots.to.value = 'Palo Alto';
            def.intent.slots.count.value = 'appletree';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.match(/The next train from [\w ]+ to [\w ]+ will take [\w ]+ and leaves in [\w ]+\. /);
        });

        it('returns an error message for no stops', function() {
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your departure stop. Where do you want to go?');
        });
        it('returns an error message for one stops', function() {
            def.intent.slots.from.value = 'San Francisco';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t understand your destination. Where do you want to go?');
        });
        it('returns an error message for wrong stops', function() {
            def.intent.slots.from.value = 'Butter';
            def.intent.slots.to.value = 'Johnathan';
            return expect(fn(def.intent, def.ses, def.cb)).to.eventually.eql('I couldn\'t find a train from Butter to Johnathan. Where do you want to go?');
        });
    });
});
