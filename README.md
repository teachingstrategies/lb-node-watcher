
# Load Balancer Watcher

This lambda function returns a JSON object that contains arrays - one for each load balancer object. 
As configured in the repo, the function checks for 2 things in each individual node
- Is the health check page configured (not a 404) and returning healthy
- The API loads with a 200

All config is done in `config.js`
- It has all the nodes
- There is a timeout (in seconds) at the beginning of the file (requestTimeout)
- There is a a list of cluster names: 
`const clusters = ["cluster1", "cluster2"];`
- Five functions: `inLbTest(), inLbUrl(), healthCheckTest(), healthCheckUrl(), resultsHandler()`
- `resultsHandler()` lets you process and take action on the results.  In the way written, if 
  there is a env variable called SLACK_STATUS = true, it will send a slack message with configured
  HOOK_URL webhook env var and to the channel, CHANNEL from the SENDER env var.


When deployed as a lambda with a function URL, you can:
- pass a ?*cluster*=*name* to only test a single cluster
- pass a ?badnodes to only return the badnodes in the results