/*jshint esversion: 8 */


const https = require("https");
const fetchUrl = require("fetch").fetchUrl;

// because the nodes' SSL cert doesn't match the URL,
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

/*
 *  CONFIG
 */

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
	return `https://${node.host}/servertest/test.html`;
};

/* These two functions are for testing if the node is in fact healthy */
// this is a function that is past as a parameter to test the actual api
const healthCheckTest = (response) => {
	if (response.meta.status == 200) return true;
	return false;
};

// The format of the health check URL
const healthCheckUrl = (node) => {
	return `https://${node.host}/api.html`;
};

/*
 *  END OF CONFIG
 */

// Takes a URL and a function that tests the response and returns a boolean
const checkNode = (url, testFunc) => {
	return new Promise((resolve, reject) => {
		fetchUrl(
			url,
			{ agentHttps: httpsAgent, timeout: requestTimeout * 1000 },
			function (error, meta, body) {
				// package the response into an object to pass to the test func
				const response = { error: error, meta: meta, body: body };

				// if there is an error in the response return false
				if (typeof response.error == undefined) {
					resolve(false);
				}

				// test the node response using the function passed in
				try {
					resolve(testFunc(response));
				} catch (err) {
					resolve(false);
				}
			}
		);
	});
};

// check all nodes in the cluster
const checkCluster = async (clusterName, nodes) => {
	let results = [];
	for (let index = 0; index < nodes.length; index++) {
		let node = nodes[index];

		if (node.cluster == clusterName) {
			node.isInLb = await checkNode(inLbUrl(node), inLbTest);
			node.apiStatus = await checkNode(healthCheckUrl(node), healthCheckTest);

			results.push(node);
		}
	}
	return results;
};

// handles all the clusters
const checkClusters = async (nodes) => {
	let clusterStatus = [];
	for (let index = 0; index < clusters.length; index++) {
		let clusterName = clusters[index];
		clusterStatus.push(await checkCluster(clusterName, nodes));
	}
	return clusterStatus;
};

// lambda framework
exports.handler = async function (event, context) {
	// load the nodes from the JSON config file and then check the clusters
	let nodes = require("./nodes.json");
	return checkClusters(nodes);
};

// local testing
/* exports.handler({}, {}).then((res) => {
	// console.log(JSON.stringify(res));

	res.forEach(cluster => {
		
		cluster.forEach(node => {
			console.log(`${node.hostName} (${node.cluster}: ${node.host}) good:`,  (node.isInLb && node.apiStatus))
			if (!(node.isInLb || node.apiStatus))
				console.log('In LB:', node.isInLb, 'and healthy:', node.apiStatus)
		});
	});

}); 
*/