/* eslint-env node, es6 */

const moment = require('moment-timezone');
const caltrain = require('./caltrain');

function areStationsValid(slots) {
    if (!(slots && slots.from && slots.from.value)) {
        return {
            result: false,
            message: 'I couldn\'t understand your departure stop. Where do you want to go?',
            shouldEndSession: false
        };
    }
    if (!(slots && slots.to && slots.to.value)) {
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

function answerNoTripsFound(slots) {
    return {
        shouldEndSession: false,
        speechOutput: 'I couldn\'t find a train from ' + slots.from.value + ' to ' + slots.to.value + '. Where do you want to go?'
    };
}

exports.getNextTrain = function(intent, session, callback) {
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';

    var validSoFar = areStationsValid(intent.slots);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        return validSoFar.message;
    }

    var trips = caltrain(intent.slots.from.value, intent.slots.to.value);

    if (!trips.length) {
        var res = answerNoTripsFound(intent.slots);
        callback({}, buildResponse(res.speechOutput, res.repromptText, res.shouldEndSession));
        return res.speechOutput;
    }

    speechOutput = 'The next train from ' + intent.slots.from.value + ' to ' + intent.slots.to.value +
        ' will take ' + trips[0].durationInMinutes + ' and leaves ' + trips[0].timeToDepartureInMinutes + '. ';

    callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));

    return speechOutput;
};

exports.getNextTrains = function(intent, session, callback) {
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';

    var validSoFar = areStationsValid(intent.slots);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        return validSoFar.message;
    }

    var count = parseInt(intent.slots.count && intent.slots.count.value, 10) || 1;

    if (count < 2) {
        return exports.getNextTrain(intent, session, callback);
    }

    var trips = caltrain(intent.slots.from.value, intent.slots.to.value, undefined, count);

    if (!trips.length) {
        var res = answerNoTripsFound(intent.slots);
        callback({}, buildResponse(res.speechOutput, res.repromptText, res.shouldEndSession));
        return res.speechOutput;
    }

    speechOutput = 'The next ' + count + ' trains from ' + intent.slots.from.value + ' to ' + intent.slots.to.value + ': ';
    trips.forEach(function(trip) {
        speechOutput += 'Travelling for ' + trip.durationInMinutes + ', leaving ' + trip.timeToDepartureInMinutes + '. ';
    });
    speechOutput += 'Have a great trip!';

    callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));

    return speechOutput;
};

exports.getNextTrainsFuture = function(intent, session, callback) {
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';

    var validSoFar = areStationsValid(intent.slots);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        return validSoFar.message;
    }

    var count = parseInt(intent.slots.count && intent.slots.count.value, 10) || 1;

    if (count < 2) {
        return exports.getNextTrainFuture(intent, session, callback);
    }

    var delta = moment.duration(intent.slots.delta && intent.slots.delta.value);
    if (!intent.slots.delta || !intent.slots.delta.value || !moment.isDuration(delta) || (delta.asSeconds() > -60 && delta.asSeconds() < 60)) {
        return exports.getNextTrains(intent, session, callback);
    }

    var tripStartDate = moment().tz('America/Los_Angeles').add(delta);
    var trips = caltrain(intent.slots.from.value, intent.slots.to.value, tripStartDate, count);

    if (!trips.length) {
        var res = answerNoTripsFound(intent.slots);
        callback({}, buildResponse(res.speechOutput, res.repromptText, res.shouldEndSession));
        return res.speechOutput;
    }

    var isTripInFuture = tripStartDate.isAfter(moment());
    speechOutput = 'The next ' + count + ' trains from ' + intent.slots.from.value + ' to ' + intent.slots.to.value + ', starting ' + delta.humanize(true) + ': ';
    trips.forEach(function(trip) {
        speechOutput += 'Travelling for ' + trip.durationInMinutes + ', ' + (isTripInFuture ? 'leaving ' : 'left ') + trip.timeToDepartureInMinutes + '. ';
    });
    speechOutput += 'Have a great trip!';

    callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));

    return speechOutput;
};

exports.getNextTrainFuture = function(intent, session, callback) {
    var repromptText = null;
    var shouldEndSession = true;
    var speechOutput = '';

    var validSoFar = areStationsValid(intent.slots);
    if (!validSoFar.result) {
        callback({}, buildResponse(validSoFar.message, repromptText, validSoFar.shouldEndSession));
        return validSoFar.message;
    }

    var delta = moment.duration(intent.slots.delta && intent.slots.delta.value);
    if (!intent.slots.delta || !intent.slots.delta.value || !moment.isDuration(delta) || (delta.asSeconds() > -60 && delta.asSeconds() < 60)) {
        return exports.getNextTrain(intent, session, callback);
    }
    var tripStartDate = moment().tz('America/Los_Angeles').add(delta);
    var trips = caltrain(intent.slots.from.value, intent.slots.to.value, tripStartDate);

    if (!trips.length) {
        var res = answerNoTripsFound(intent.slots);
        callback({}, buildResponse(res.speechOutput, res.repromptText, res.shouldEndSession));
        return res.speechOutput;
    }

    var isTripInFuture = tripStartDate.isAfter(moment());
    speechOutput = 'The next train ' + delta.humanize() + (isTripInFuture ? ' from now' : ' ago') + ' will take ' + trips[0].durationInMinutes +
        ' from ' + intent.slots.from.value + ' to ' + intent.slots.to.value +
        ' and' + (isTripInFuture ? ' leaves ' : ' left ') + trips[0].timeToDepartureInMinutes + '. ';

    callback({}, buildResponse(speechOutput, repromptText, shouldEndSession));

    return speechOutput;
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
