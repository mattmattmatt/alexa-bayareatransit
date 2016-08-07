/* eslint-env node, es6 */

const moment = require('moment-timezone');
const caltrain = require('./caltrain');
const bart = require('./bart');
const deferred = require('deferred');

function areStationsValid(from, to) {
    if (!(from && from.value)) {
        return {
            result: false,
            message: 'I couldn\'t understand your departure stop. Where do you want to go?',
            shouldEndSession: false
        };
    }
    if (!(to && to.value)) {
        return {
            result: false,
            message: 'I couldn\'t understand your destination. Where do you want to go?',
            shouldEndSession: false
        };
    }
    return {
        result: true
    };
}

function answerNoTripsFound(from, to) {
    return {
        shouldEndSession: false,
        speechOutput: 'I couldn\'t find a train from ' + from.value + ' to ' + to.value + '. Where do you want to go?'
    };
}

exports.getNextTrain = function(intent, session, callback, serviceProvider) {
    var def = deferred();
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';
    var from;
    var to;
    var scheduleProvider;

    switch (serviceProvider) {
        case 'bart':
            from = intent.slots.fromBart;
            to = intent.slots.toBart;
            scheduleProvider = bart;
            break;
        case 'caltrain':
        default:
            from = intent.slots.fromCaltrain;
            to = intent.slots.toCaltrain;
            scheduleProvider = caltrain;
    }

    var validSoFar = areStationsValid(from, to);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        def.resolve(validSoFar.message);
        return def.promise;
    }

    scheduleProvider(from.value, to.value).then(function(trips) {
        if (!trips.length) {
            var noTrips = answerNoTripsFound(from, to);
            callback({}, buildResponse(noTrips.speechOutput, noTrips.repromptText, noTrips.shouldEndSession));
            def.resolve(noTrips.speechOutput);
            return def.promise;
        }

        speechOutput = 'The next train from ' + from.value + ' to ' + to.value +
        ' will take ' + trips[0].durationInMinutes + ' and leaves ' + trips[0].timeToDepartureInMinutes + '. ';

        callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));
        def.resolve(speechOutput);
    });
    return def.promise;
};

exports.getNextTrains = function(intent, session, callback, serviceProvider) {
    var def = deferred();
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';
    var from;
    var to;
    var scheduleProvider;

    switch (serviceProvider) {
        case 'bart':
            from = intent.slots.fromBart;
            to = intent.slots.toBart;
            scheduleProvider = bart;
            break;
        case 'caltrain':
        default:
            from = intent.slots.fromCaltrain;
            to = intent.slots.toCaltrain;
            scheduleProvider = caltrain;
    }

    var validSoFar = areStationsValid(from, to);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        def.resolve(validSoFar.message);
        return def.promise;
    }

    var count = parseInt(intent.slots.count && intent.slots.count.value, 10) || 1;

    if (count < 2) {
        return exports.getNextTrain(intent, session, callback, serviceProvider);
    }

    scheduleProvider(from.value, to.value, undefined, count).then(function(trips) {
        if (!trips.length) {
            var noTrips = answerNoTripsFound(from, to);
            callback({}, buildResponse(noTrips.speechOutput, noTrips.repromptText, noTrips.shouldEndSession));
            def.resolve(noTrips.speechOutput);
            return def.promise;
        }

        speechOutput = 'The next ' + count + ' trains from ' + from.value + ' to ' + to.value + ': ';
        trips.forEach(function(trip) {
            speechOutput += 'Travelling for ' + trip.durationInMinutes + ', leaving ' + trip.timeToDepartureInMinutes + '. ';
        });
        speechOutput += 'Have a great trip!';

        callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));
        def.resolve(speechOutput);
    });
    return def.promise;
};

exports.getNextTrainsFuture = function(intent, session, callback, serviceProvider) {
    var def = deferred();
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';
    var from;
    var to;
    var scheduleProvider;

    switch (serviceProvider) {
        case 'bart':
            from = intent.slots.fromBart;
            to = intent.slots.toBart;
            scheduleProvider = bart;
            break;
        case 'caltrain':
        default:
            from = intent.slots.fromCaltrain;
            to = intent.slots.toCaltrain;
            scheduleProvider = caltrain;
    }

    var validSoFar = areStationsValid(from, to);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        def.resolve(validSoFar.message);
        return def.promise;
    }

    var count = parseInt(intent.slots.count && intent.slots.count.value, 10) || 1;

    if (count < 2) {
        return exports.getNextTrainFuture(intent, session, callback, serviceProvider);
    }

    var delta = moment.duration(intent.slots.delta && intent.slots.delta.value);
    if (!intent.slots.delta || !intent.slots.delta.value || !moment.isDuration(delta) || (delta.asSeconds() > -60 && delta.asSeconds() < 60)) {
        return exports.getNextTrains(intent, session, callback, serviceProvider);
    }

    var tripStartDate = moment().tz('America/Los_Angeles').add(delta);
    scheduleProvider(from.value, to.value, tripStartDate, count).then(function(trips) {
        if (!trips.length) {
            var noTrips = answerNoTripsFound(from, to);
            callback({}, buildResponse(noTrips.speechOutput, noTrips.repromptText, noTrips.shouldEndSession));
            def.resolve(noTrips.speechOutput);
            return def.promise;
        }

        var isTripInFuture = tripStartDate.isAfter(moment());
        speechOutput = 'The next ' + count + ' trains from ' + from.value + ' to ' + to.value + ', starting ' + delta.humanize(true) + ': ';
        trips.forEach(function(trip) {
            speechOutput += 'Travelling for ' + trip.durationInMinutes + ', ' + (isTripInFuture ? 'leaving ' : 'left ') + trip.timeToDepartureInMinutes + '. ';
        });
        speechOutput += 'Have a great trip!';

        callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));
        def.resolve(speechOutput);
    });
    return def.promise;
};

exports.getNextTrainFuture = function(intent, session, callback, serviceProvider) {
    var def = deferred();
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';
    var from;
    var to;
    var scheduleProvider;

    switch (serviceProvider) {
        case 'bart':
            from = intent.slots.fromBart;
            to = intent.slots.toBart;
            scheduleProvider = bart;
            break;
        case 'caltrain':
        default:
            from = intent.slots.fromCaltrain;
            to = intent.slots.toCaltrain;
            scheduleProvider = caltrain;
    }

    var validSoFar = areStationsValid(from, to);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        def.resolve(validSoFar.message);
        return def.promise;
    }

    var delta = moment.duration(intent.slots.delta && intent.slots.delta.value);
    if (!intent.slots.delta || !intent.slots.delta.value || !moment.isDuration(delta) || (delta.asSeconds() > -60 && delta.asSeconds() < 60)) {
        return exports.getNextTrain(intent, session, callback, serviceProvider);
    }
    var tripStartDate = moment().tz('America/Los_Angeles').add(delta);
    scheduleProvider(from.value, to.value, tripStartDate).then(function(trips) {
        if (!trips.length) {
            var noTrips = answerNoTripsFound(from, to);
            callback({}, buildResponse(noTrips.speechOutput, noTrips.repromptText, noTrips.shouldEndSession));
            def.resolve(noTrips.speechOutput);
            return def.promise;
        }

        var isTripInFuture = tripStartDate.isAfter(moment());
        speechOutput = 'The next train ' + delta.humanize() + (isTripInFuture ? ' from now' : ' ago') + ' will take ' + trips[0].durationInMinutes +
        ' from ' + from.value + ' to ' + to.value +
        ' and' + (isTripInFuture ? ' leaves ' : ' left ') + trips[0].timeToDepartureInMinutes + '. ';

        callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));
        def.resolve(speechOutput);
    });
    return def.promise;
};


exports.getWelcomeResponse = function(callback) {
    var speechOutput = 'Welcome to "Bay Area transit". Ask me for cal train trips from one station to another.';
    var repromptText = 'You can say something like "in twenty minutes from San Francisco to Mountain View". Where do you want to go?';
    var shouldEndSession = false;

    callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));
};


exports.handleSessionEndRequest = function(callback) {
    var speechOutput = 'Ok, bye bye!';
    var shouldEndSession = true;

    callback({}, buildResponse(speechOutput, null, shouldEndSession));
};

function buildResponse(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'PlainText',
            text: output
        },
        // card: {
        //     type: 'Simple',
        //     title: 'Next Caltrain - ' + title,
        //     content: 'Next Caltrain - ' + output
        // },
        reprompt: {
            outputSpeech: {
                type: 'PlainText',
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}
