/* eslint-env node, mocha, es6 */

const chaiAsPromised = require('chai-as-promised');
const chai = require('chai');
chai.use(chaiAsPromised);
const expect = chai.expect;
const bart = require('./bart');
const caltrain = require('./caltrain');
const moment = require('moment-timezone');

bart.configure({shouldLog: false});
caltrain.configure({shouldLog: false});

function testSchedule(schedules, def) {

        describe('returns an array', function() {
            it('returns an empty array for no params', function() {
                return expect(schedules()).to.eventually.be.an('array').and.to.have.length.of(0);
            });
            it('returns an empty array for an object param', function() {
                return expect(schedules({})).to.eventually.be.an('array').and.to.have.length.of(0);
            });
            it('returns an empty array for two object params and stupid date and stop counts', function() {
                return expect(schedules({}, {}, '', 'test')).to.eventually.be.an('array').and.to.have.length.of(0);
            });
            it('returns an empty array for invalid stops', function() {
                return expect(schedules('test', 'what')).to.eventually.be.an('array').and.to.have.length.of(0);
            });
            it('returns an empty array for invalid stops and many stops', function() {
                return expect(schedules('test', 'what', null, 5)).to.eventually.be.an('array').and.to.have.length.of(0);
            });
            it('returns an array for valid stops', function() {
                return expect(schedules(def.from, def.to)).to.eventually.be.an('array').and.to.have.length.of(1);
            });
            it('returns an array for valid stops and a date', function() {
                return expect(schedules(def.from, def.to, def.date)).to.eventually.be.an('array').and.to.have.length.of(1);
            });
            it('returns an array for valid stops and a moment', function() {
                return expect(schedules(def.from, def.to, def.moment)).to.eventually.be.an('array').and.to.have.length.of(1);
            });
            it('returns an array for valid stops and a date and high stop count', function() {
                return expect(schedules(def.from, def.to, def.date, 10)).to.eventually.be.an('array').and.to.have.length.of(10);
            });
            it('returns an array for valid stops and a moment and high stop count', function() {
                return expect(schedules(def.from, def.to, def.moment, 10)).to.eventually.be.an('array').and.to.have.length.of(10);
            });
        });

        describe('returns the requested amount of trips', function() {
            it('returns the requested amount of trips', function() {
                return Promise.all([
                    expect(schedules(def.from, def.to, def.date)).to.eventually.have.length.of(1),
                    expect(schedules(def.from, def.to, def.moment)).to.eventually.have.length.of(1),
                    expect(schedules(def.from, def.to, def.date, 10)).to.eventually.have.length.of(10),
                    expect(schedules(def.from, def.to, def.moment, 10)).to.eventually.have.length.of(10),
                    expect(schedules(def.from, def.to, undefined, 10)).to.eventually.have.length.of(10)
                ]);
            });
        });

        describe('returns a valid trip result', function() {
            it('returns a valid trip result', function(done) {
                schedules(def.from, def.to, def.date).then(function(result) {
                    expect(result[0]).to.have.all.keys(['durationInMinutes', 'timeToDepartureInMinutes']);
                    done();
                });
            });
        });

        // it('prints the next 5 trains', function(done) {
        //     schedules(def.from, def.to, def.date, 5).then(function(result) {
        //         console.log('next 5 trains:\n', result);
        //         done();
        //     });
        // });
}

describe('Schedules', function() {
    describe('Bart', function() {
        testSchedule(bart, {
            from: 'mcar',
            to: '19th',
            date: (new Date()),
            moment: moment().tz('America/Los_Angeles')
        });
    });

    describe('Caltrain', function() {
        testSchedule(caltrain, {
            from: 'sf',
            to: 'pa',
            date: (new Date()),
            moment: moment().tz('America/Los_Angeles')
        });
    });
});
