/*jshint esversion: 8 */
const https = require("https");
const fetchUrl = require("fetch").fetchUrl;
const config = require("./config");

// because the nodes' SSL cert doesn't match the URL,
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
});

// Takes a URL and a function that tests the response and returns a boolean
const checkNode = (url, testFunc) => {
	return new Promise((resolve, reject) => {
		fetchUrl(
			url,
			{ agentHttps: httpsAgent, timeout: config.requestTimeout * 1000 },
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
			node.isInLb = await checkNode(config.inLbUrl(node), config.inLbTest);
			node.apiStatus = await checkNode(
				config.healthCheckUrl(node),
				config.healthCheckTest
			);
			results.push(node);
		}
	}
	return results;
};

// handles all the clusters
const checkClusters = async (clusters, nodes, clusterToCheck) => {
	let clusterStatus = [];
	for (let index = 0; index < clusters.length; index++) {
		let clusterName = clusters[index];
		if (clusterToCheck == "all") {
			clusterStatus.push(await checkCluster(clusterName, nodes));
		} else {
			if (clusterName == clusterToCheck)
				clusterStatus.push(await checkCluster(clusterName, nodes));
		}
	}
	return clusterStatus;
};

// lambda framework
exports.handler = async function (event, context) {
	let clusterHealth = [];
	let resultsHandlerArgs = {displayAll : true, slackStatus : false};
	

	// if slack status environment variable is defined and is true, Slack the status
	if (process.env.SLACK_STATUS == 'true') {
		resultsHandlerArgs = { displayAll: false, slackStatus: true };
		clusterHealth = await checkClusters(config.clusters, config.nodes, "all");
	} else if (typeof event.queryStringParameters === "undefined" || event.queryStringParameters === {}) {
		clusterHealth = await checkClusters(config.clusters, config.nodes, "all");	
	}

	// if a cluster name is passed into the query params, only check that cluster
	else if (typeof event.queryStringParameters.cluster !== "undefined") {
		clusterHealth = await checkClusters(
			config.clusters,
			config.nodes,
			event.queryStringParameters.cluster
		);

	// if "badnodes" is passed in as a query param, only return the bad nodes
	} else if (typeof event.queryStringParameters.badnodes !== "undefined")	{	
		clusterHealth = await checkClusters(config.clusters, config.nodes, "all");
		resultsHandlerArgs.displayAll=false;
	} 
	
	return config.resultsHandler(clusterHealth, resultsHandlerArgs);

};
