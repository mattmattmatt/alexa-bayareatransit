/* eslint-env node, es6 */

var deferred = require('deferred');
var bart = new require('bay-area-rapid-transit')('MW9S-E7SL-26DU-VV8V');
var stopMap = require('./bart-mappings');

const moment = require('moment-timezone');
moment.relativeTimeThreshold('m', 66);

var shouldLog = true;
var origStartDate;

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
        b: 2,
        a: 4
    });
}

function getMomentFromTrip(trip, origOrDest) {
    const prefix = origOrDest || 'orig';
    var date = trip[prefix + 'TimeDate'].replace(/ /ig, '');
    var time = trip[prefix + 'TimeMin'];
    var m = moment.tz(date + ' ' + time, 'MM/DD/YYYY h:mm A', 'America/Los_Angeles');
    return m;
}

function gatherSchedules(schedules, from, to, date, stopCount) {
    if (schedules.length >= stopCount) {
        // remove elements of result that were not asked for
        schedules.splice(stopCount);
        return schedules;
    } else {
        var plannedDate = moment(date);
        var lastTrip = schedules[schedules.length - 1];
        if (lastTrip) {
            plannedDate = getMomentFromTrip(lastTrip).add(1, 'minutes');
        }
        // log('plannedDate', plannedDate.toString(), Math.random());
        return getMoreSchedules(from, to, plannedDate).then(function(result) {
            // Filter trips that are before the originalStartDate or before the
            // last trip in the current result set. This could happen because of the
            // `b=2` parameter of the BART API call.
            result = result.filter(function(trip) {
                var tripDate = getMomentFromTrip(trip);
                var keepTrip = tripDate.isAfter(origStartDate.add(1, 'minutes'));
                keepTrip = keepTrip && tripDate.isAfter(plannedDate);
                // log('tripDate', tripDate.toString(), 'keepTrip', keepTrip);
                return keepTrip;
            });
            return gatherSchedules(schedules.concat(result), from, to, plannedDate, stopCount);
        });
    }
}

function getSchedules(from, to, date, stopCount) {
    var def = deferred();
    stopCount = parseInt(stopCount, 10) || 1;
    date = moment(date).tz('America/Los_Angeles');
    log('from, to, date, stopCount', from, to, date.toString(), stopCount);

    if (typeof from !== 'string' || typeof to !== 'string' || typeof date !== 'object' || typeof stopCount !== 'number') {
        def.resolve([]);
    } else {
        var mappedFrom = stopMap[(from || '').toLowerCase()];
        var mappedTo = stopMap[(to || '').toLowerCase()];
        origStartDate = date;

        if (typeof mappedFrom !== 'string' || typeof mappedTo !== 'string') {
            def.resolve([]);
            return def.promise;
        }

        gatherSchedules([], mappedFrom, mappedTo, date, stopCount).then(function(result) {
            result = result.filter(function(trip) {
                return typeof trip !== 'undefined';
            });

            log('');
            result = result.map(function(trip, i) {
                var departureDate = getMomentFromTrip(trip);
                var now = moment().tz('America/Los_Angeles');
                var timeToDepartureInMinutes = departureDate.from(now);
                log('trip ' + i + ': departureDate, now, timeToDepartureInMinutes', moment(departureDate.toDate()).tz('America/Los_Angeles').toString(), moment(now.toDate()).tz('America/Los_Angeles').toString(), timeToDepartureInMinutes);
                var durationInMinutes = moment.duration(getMomentFromTrip(trip, 'dest').diff(departureDate)).asMinutes() + ' minutes';
                return {
                    timeToDepartureInMinutes,
                    durationInMinutes
                };
            });
            log('');

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
