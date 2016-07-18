/* eslint-env node, es6 */

const ct = require('nextcaltrain');
const moment = require('moment-timezone');
moment.relativeTimeThreshold('m', 66);

function getSchedules(from, to, date, stopCount) {
    var getNextStop;
    console.log('getSchedules', from, to, date ? date.toString() : undefined, stopCount);

    date = moment(date).tz('America/Los_Angeles');
    stopCount = parseInt(stopCount, 10) || 1;

    if (typeof from !== 'string' || typeof to !== 'string' || typeof date !== 'object' || typeof stopCount !== 'number') {
        console.log('Invalid parameters', from, to, date.toDate(), stopCount, typeof from, typeof to, typeof date, typeof stopCount);
        return [];
    }

    console.log('Looking for stops: ', from, to, moment(date.toDate()).tz('America/Los_Angeles').toString(), stopCount);

    try {
        getNextStop = ct({
            from: from,
            to: to,
            date: moment(date.toDate()).tz('America/Los_Angeles').toDate()
        });
    } catch(e) {
        if (e.code !== 'STOP_NOT_FOUND') {
            console.log(e);
        } else {
            console.log('Stop not found', from, to, JSON.stringify(e));
        }
        return [];
    }

    var trips = [];
    console.log('');
    for (var i = 0; i < stopCount; i++) {
        var trip = getNextStop();
        var departureDate = moment(trip.tripStops[0].date).tz('America/Los_Angeles');
        var now = moment().tz('America/Los_Angeles');
        var timeToDepartureInMinutes = departureDate.from(now);
        console.log('trip ' + i + ': departureDate, now, timeToDepartureInMinutes', moment(departureDate.toDate()).tz('America/Los_Angeles').toString(), moment(now.toDate()).tz('America/Los_Angeles').toString(), timeToDepartureInMinutes);
        console.log('');
        var durationInMinutes = moment.duration(moment(trip.tripStops[trip.tripStops.length - 1].date).diff(trip.tripStops[0].date)).asMinutes() + ' minutes';
        trips.push({
            timeToDepartureInMinutes,
            durationInMinutes
        });
    }
    console.log('getSchedules trips', trips);

    return trips;
}

module.exports = getSchedules;
