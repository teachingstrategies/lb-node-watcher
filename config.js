/*jshint esversion: 8 */

const resultHelpers = require("./resultHelpers.js");

// sets the timeout for the node tests.
const requestTimeout = 10;

// sets the name of the clusters
const clusters = ["cluster1", "cluster2"];

// for Slack Messages
const channel = process.env.CHANNEL; 
const hookUrl = process.env.HOOK_URL;
const sender = process.env.SENDER;

/* These two functions are for testing if the node is in fact healthy */
// this is a function that is past as a parameter to test the actual api
function healthCheckTest(response) {
	if (response.meta.status == 200) return true;
	return false;
}

// The format of the health check URL
function healthCheckUrl(node) {
	return `https://${node.host}/api/v1/index.html`;
}

function resultsHandler(results, args) {
	if (args.displayAll == false) {
		results = resultHelpers.removeHealthyNodes(results);
	}

	if (args.slackStatus == true && results.length > 0) {
		let msg = "";
		
		// compose message with status of each bad node
		results.forEach((node) => {
			msg += `Server name: ${node.hostName}, LB test: ${node.isInLb}, API test: ${node.apiStatus}. \r`;
		});

		resultHelpers.sendSlackMessage(hookUrl, channel, msg, sender);
	}
	
	return results;
}


const nodes = [
   {
      "hostName":"host1",
      "host":"192.168.1.1",
      "cluster":"cluster1"
   },
   {
     "hostName":"host2",
     "host":"192.168.1.2",
     "cluster":"cluster2"
  }
];

var config = {
	nodes: nodes,
	requestTimeout: requestTimeout, // sets the timeout for the node tests
	clusters: clusters,
	inLbTest: inLbTest,
	inLbUrl: inLbUrl,
	healthCheckUrl: healthCheckUrl,
	healthCheckTest: healthCheckTest,
	resultsHandler: resultsHandler,
};

module.exports = config;
