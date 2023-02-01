
# Load Balancer Watcher

This lambda function returns a JSON object that contains arrays - one for each load balancer object. 
As configured in the repo, the function checks for 2 things in each individual node
- Is the health check page configured (not a 404) and returning healthy
- The API loads with a 200

All config is done in `config.js`
- It has all the  nodes
- There is a timeout (in seconds) at the beginning of the file (requestTimeout)
- There is a a list of cluster names: 
`const clusters = ["cluster1", "cluster2"];`
- Four functions: `inLbTest(), inLbUrl(), healthCheckTest(), healthCheckUrl()`

When deployed as a lambda, you can pass a ?*cluster*=*name* to only test a single cluster