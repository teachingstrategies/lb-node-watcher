/*jshint esversion: 8 */

// sets the timeout for the node tests.

const requestTimeout = 5;

// sets the name of the clusters
const clusters = ["cluster1", "cluster2"];

/* These two functions are for testing if the node is in the LB */
// this is a function that is past as a parameter to test the health check response
const inLbTest = (response) => {
	if (response.body.toString().substr(0, 6) == "--OK--") return true;
	return false;
};

// The format of the health check URL
const inLbUrl = (node) => {
	return `https://${node.host}/healthcheck/test.html`;
};

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
};

module.exports = config;
