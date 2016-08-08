/* eslint-env node, mocha, es6 */

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(chaiAsPromised);
// const expect = chai.expect;
const bart = require('./bart');
const intents = require('./intents');
const moment = require('moment-timezone');

bart.configure({shouldLog: false});
intents.configure({shouldLog: false});

describe('time', function() {
    it('bart', function(done) {
        bart('civic center', 'oakland city', moment().add(0, 'minutes'), 12).then(function(r) {
            console.log(r);
            done();
        });
    });
});
