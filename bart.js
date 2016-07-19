/* eslint-env node, es6 */

var deferred = require('deferred');
var bart = new require('bay-area-rapid-transit')('MW9S-E7SL-26DU-VV8V');

const moment = require('moment-timezone');
moment.relativeTimeThreshold('m', 66);

var shouldLog = true;

function log() {
    if (shouldLog) {
        console.log.apply(console, arguments);
    }
}

function getMoreSchedules(from, to, date) {
    // log(from, to, date.toString(), date.format('MM/DD/YYYY'), date.format('h:mm a'));
    return bart.quickPlannerDepart({
        date: date.format('MM/DD/YYYY'),
        time: date.format('h:mm a'),
        orig: from,
        dest: to,
        b: 0,
        a: 4
    });
}

function gatherSchedules(schedules, from, to, date, stopCount) {
    if (schedules.length >= stopCount) {
        // remove elements of result that were not asked for
        schedules.splice(stopCount);
        return schedules;
    } else {
        var tripDate = moment(date);
        var lastTrip = schedules[schedules.length - 1];
        if (lastTrip) {
            tripDate = moment(new Date(lastTrip.origTimeDate + ' ' + lastTrip.origTimeMin)).add(1, 'minutes');
        }
        return getMoreSchedules(from, to, tripDate).then(function(result) {
            return gatherSchedules(schedules.concat(result), from, to, date, stopCount);
        });
    }
}

function getSchedules(from, to, date, stopCount) {
    var def = deferred();
    stopCount = parseInt(stopCount, 10) || 1;
    date = moment(date);

    if (typeof from !== 'string' || typeof to !== 'string' || typeof date !== 'object' || typeof stopCount !== 'number') {
        def.resolve([]);
    } else {
        gatherSchedules([], from, to, date, stopCount).then(function(result) {
            result = result.filter(function(trip) {
                return typeof trip !== 'undefined';
            });

            result = result.map(function(trip, i) {
                var departureDate = moment(new Date(trip.origTimeDate + ' ' + trip.origTimeMin)).tz('America/Los_Angeles');
                var now = moment().tz('America/Los_Angeles');
                var timeToDepartureInMinutes = departureDate.from(now);
                log('trip ' + i + ': departureDate, now, timeToDepartureInMinutes', moment(departureDate.toDate()).tz('America/Los_Angeles').toString(), moment(now.toDate()).tz('America/Los_Angeles').toString(), timeToDepartureInMinutes);
                log('');
                var durationInMinutes = moment.duration(moment(new Date(trip.destTimeDate + ' ' + trip.destTimeMin)).diff(departureDate)).asMinutes() + ' minutes';
                return {
                    timeToDepartureInMinutes,
                    durationInMinutes
                };
            });

            def.resolve(result);
        }, function() {
            def.resolve([]);
        });
    }

    return def.promise;
}

function configure(conf) {
    shouldLog = conf.shouldLog;
}

module.exports = getSchedules;
module.exports.configure = configure;
