/* eslint-env node, mocha */

var expect = require('chai').expect;
var moment = require('moment-timezone');
var schedules = require('./caltrain');

describe('Schedules', function() {
    var def = {
        from: 'sf',
        to: 'pa',
        date: (new Date()),
        moment: moment().tz('America/Los_Angeles')
    };

    it('exists', function() {
        expect(schedules).to.exist;
    });

    it('returns an array', function() {
        expect(schedules()).to.be.an('array').and.to.have.length.of(0);
        expect(schedules({})).to.be.an('array').and.to.have.length.of(0);
        expect(schedules({}, {}, 'hello', 'test')).to.be.an('array').and.to.have.length.of(0);
        expect(schedules('test', 'what')).to.be.an('array').and.to.have.length.of(0);
        expect(schedules(def.from, def.to)).to.be.an('array').and.to.have.length.of(1);
        expect(schedules(def.from, def.to, def.date)).to.be.an('array').and.to.have.length.of(1);
        expect(schedules(def.from, def.to, def.moment)).to.be.an('array').and.to.have.length.of(1);
        expect(schedules(def.from, def.to, def.date, 10)).to.be.an('array').and.to.have.length.of(10);
        expect(schedules(def.from, def.to, def.moment, 10)).to.be.an('array').and.to.have.length.of(10);
    });

    it('returns the requested amount of trips', function() {
        expect(schedules(def.from, def.to, def.date)).to.have.length.of(1);
        expect(schedules(def.from, def.to, def.moment)).to.have.length.of(1);
        expect(schedules(def.from, def.to, def.date, 10)).to.have.length.of(10);
        expect(schedules(def.from, def.to, def.moment, 10)).to.have.length.of(10);
        expect(schedules(def.from, def.to, undefined, 10)).to.have.length.of(10);
    });

    it('returns a valid trip result', function() {
        expect(schedules(def.from, def.to, def.date)[0]).to.have.all.keys(['durationInMinutes', 'timeToDepartureInMinutes']);
        expect(schedules(def.from, def.to, def.moment)[0]).to.have.all.keys(['durationInMinutes', 'timeToDepartureInMinutes']);
        expect(schedules(def.from, def.to, def.moment)[0].durationInMinutes).to.include(' minutes');
        expect(schedules(def.from, def.to, def.moment)[0].timeToDepartureInMinutes).to.include('in ');
    });

    it('prints the next 5 trains', function() {
        console.log('next 5 trains:\n', schedules(def.from, def.to, def.date, 5));
    });
});
