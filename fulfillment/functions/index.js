// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient, Card} = require('dialogflow-fulfillment');
const request = require('sync-request');
const walks = JSON.parse(request('GET', 'https://decouverto.fr/walks/index.json').getBody('utf8'));
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

  function randomWalkHandler(agent) {
     let walk = walks[Math.floor(Math.random()*walks.length)];
     let out = `${walk.description} Elle fait ${((walk.distance/1000).toFixed(1) + '').replace('.', ',')} km. Elle se situe dans le secteur de ${walk.zone}. Elle est axée sur le thème  ${walk.theme}.`
     agent.add(`Une balade intéressante pour vous serait: ${walk.title}. ${out}`);
     agent.add(new Card({
         title: walk.title,
         text: out,
         buttonText: 'Apeçu',
         buttonUrl: 'https://decouverto.fr/rando/'+ walk.id,
         imageUrl: 'https://decouverto.fr/icons/192.png',
         imagAlt: 'Image du logo Découverto',
       })
     );
   }

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('RandomWalk Intent', randomWalkHandler);
  
  agent.handleRequest(intentMap);
});
