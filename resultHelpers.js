/*jshint esversion: 8 */
const Slack = require("slack-node");

function checkOverallHealth(clusters) {
	let overallHealth = true;

	clusters.forEach((cluster) => {
		cluster.forEach((node) => {
			if (node.isInLb == false || node.apiStatus == false)
				overallHealth = false;
		});
	});

	return overallHealth;
}

function removeHealthyNodes(clusters) {
	let returnClusters = [];

	// create a new array that has only the unhealthy nodes and return that
	clusters.forEach((cluster) => {
		cluster.forEach((node) => {
			if (node.isInLb == false || node.apiStatus == false)
				returnClusters.push(node);
		});
	});

	return returnClusters;
}

function sendSlackMessage(hookUrl, channel, message, username) {
	const slack = new Slack();
	slack.setWebhook(hookUrl);

	slack.webhook({channel: channel, username: username, text: message},
		function (err, response) {}
	);
}

const resultHelpers = {
	removeHealthyNodes: removeHealthyNodes,
	sendSlackMessage: sendSlackMessage,
};

module.exports = resultHelpers;
