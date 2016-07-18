/* eslint-env node, es6 */

const intents = require('./intents');
const APP_ID = 'amzn1.echo-sdk-ams.app.eb4c69c2-5e93-4034-a40a-66b736fa575c';

exports.handler = function(event, context) {
    try {
        console.log('event.session.application.applicationId=' + event.session.application.applicationId);

        if (event.session.application.applicationId !== APP_ID) {
            context.fail('Invalid Application ID');
        }

        if (event.session.new) {
            onSessionStarted({
                requestId: event.request.requestId
            }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request, event.session, function callback(sessionAttributes, speechletResponse) {
                context.succeed(buildResponse(sessionAttributes, speechletResponse));
            });
        } else if (event.request.type === 'SessionEndedRequest') {
            context.succeed();
        }
    } catch (e) {
        context.fail('Exception: ' + e);
    }
};

function onSessionStarted(sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=' + sessionStartedRequest.requestId + ', sessionId=' + session.sessionId);
}

function onLaunch(launchRequest, session, callback) {
    intents.getWelcomeResponse(callback);
}

function onIntent(intentRequest, session, callback) {
    console.log('onIntent requestId=' + intentRequest.requestId + ', sessionId=' + session.sessionId, ' intentName=' + intentRequest.intent.name);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if ('GetNextTrain' === intentName) {
        intents.getNextTrain(intent, session, callback);
    } else if ('GetNextTrains' === intentName) {
        intents.getNextTrains(intent, session, callback);
    } else if ('GetNextTrainsFuture' === intentName) {
        intents.getNextTrainsFuture(intent, session, callback);
    } else if ('GetNextTrainFuture' === intentName) {
        intents.getNextTrainFuture(intent, session, callback);
    } else if ('AMAZON.HelpIntent' === intentName) {
        intents.getWelcomeResponse(callback);
    } else if ('AMAZON.StopIntent' === intentName || 'AMAZON.CancelIntent' === intentName) {
        intents.handleSessionEndRequest(callback);
    } else {
        throw 'Invalid intent';
    }
}


function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
