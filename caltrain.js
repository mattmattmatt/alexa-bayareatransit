/* eslint-env node, es6 */

const ct = require('nextcaltrain');
const moment = require('moment-timezone');
const deferred = require('deferred');
moment.relativeTimeThreshold('m', 66);

var shouldLog = true;

function log() {
    if (shouldLog) {
        console.log.apply(console, arguments);
    }
}

function getSchedules(from, to, date, stopCount) {
    var def = deferred();
    var getNextStop;
    log('getSchedules', from, to, date ? date.toString() : undefined, stopCount);

    date = moment(date).tz('America/Los_Angeles');
    stopCount = parseInt(stopCount, 10) || 1;

    if (typeof from !== 'string' || typeof to !== 'string' || typeof date !== 'object' || typeof stopCount !== 'number') {
        log('Invalid parameters', from, to, date.toDate(), stopCount, typeof from, typeof to, typeof date, typeof stopCount);
        def.resolve([]);
        return def.promise;
    }

    log('Looking for stops: ', from, to, moment(date.toDate()).tz('America/Los_Angeles').toString(), stopCount);

    try {
        getNextStop = ct({
            from: from,
            to: to,
            date: moment(date.toDate()).tz('America/Los_Angeles').toDate()
        });
    } catch(e) {
        if (e.code !== 'STOP_NOT_FOUND') {
            log(e);
        } else {
            log('Stop not found', from, to, JSON.stringify(e));
        }
        def.resolve([]);
        return def.promise;
    }

    var trips = [];
    log('');
    for (var i = 0; i < stopCount; i++) {
        var trip = getNextStop();
        var departureDate = moment(trip.tripStops[0].date).tz('America/Los_Angeles');
        var now = moment().tz('America/Los_Angeles');
        var timeToDepartureInMinutes = departureDate.from(now);
        log('trip ' + i + ': departureDate, now, timeToDepartureInMinutes', moment(departureDate.toDate()).tz('America/Los_Angeles').toString(), moment(now.toDate()).tz('America/Los_Angeles').toString(), timeToDepartureInMinutes);
        log('');
        var durationInMinutes = moment.duration(moment(trip.tripStops[trip.tripStops.length - 1].date).diff(trip.tripStops[0].date)).asMinutes() + ' minutes';
        trips.push({
            timeToDepartureInMinutes,
            durationInMinutes
        });
    }
    log('getSchedules trips', trips);

    def.resolve(trips);
    return def.promise;
}

function configure(conf) {
    shouldLog = conf.shouldLog;
}

module.exports = getSchedules;
module.exports.configure = configure;
