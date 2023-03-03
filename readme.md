# Usage Instructions
Expectations:  
- You have docker-compose installed
- You are running node v18.7.0 (this is the version it was tested against, but you should be fine on 16.x and higher)

## Set up database
There is a docker-compose file provided to spin up the postgres database.
```
docker-compose up
```

## Copy environment file
```
cp .env.sample .env
```
- If you have your own postgres database that you're connecting to, please update the `.env` file with the appropriate connection string.
- Feel free to change the port number to something valid if 9090 is already in use

## Run app
```
npm install
npm run up
npm start
```

`npm run up` actually runs the initial migrations and gets the database configured. You could include this as part of the "post install" functionality for this task, but in production you'd want control over when the migrations actually run.

`npm run dev` is an alternative to `npm run start` if you want to utilize nodemon to hot-reload the codebase


## Assumptions/Architecture

The primary assumptions are.  
- A station = user: This was made because there was no actual mention of "user" until we hit the user stories themselves, and since the entity that would be interacting with a API was meant to be a "station" that's what I went with.
- Everything is done according to server time. That's fine, but we should probably include some additional information during signup about the actual locale time that the server is in so that we can do any necessary translations.

You'll notice that even though I used express, I wrote a small wrapper over it and the express router. Express is a great minimal starting point, but it's relatively unopinionated and that can lead to a lot of differences around how people actual implement their REST api servers. The wrapper serves to mitigate this by making a few unavoidable choices:  
- We will always utilize promises for the endpoint handlers. Express by default utilizing call backs and explicit calls to send responses back but lets you do some weird stuff where you can "attempt" to keep doing work after sending a response back even though there's no guarantee that that will happen.
- We force types and input validation via JSON schema. If you take a look at any of the endpoints you'll see that there's some json schema created that represents the expected input and a dynamic type is generated. That allows us to automate the input validation section and offload that from the actual endpoint. It also gives us type hinting while we're acutally writing the code.
- We are expected to define the output type for an endpoint.
- Each endpoint should be isolated in its own file. This gives us the ability to have related types/endpoint imlpementation/tests all located together and isolated from the rest of the system.


## Database Choice
I went with postgresql as the database solution. It will work fine, but if we are expecting a LOT of traffic it might make sense to look at a more traditional timeseries datastore (opentdsb/influxdb) to optimize how we actually store the metrics.

## Deleting Data
For now this actually deletes data - but I would probably swap to a "soft delete" functionality where deletion of weather data actually just marks that row for deletion rather than actually deleting it. We could do this a few ways:  
- Have a boolean column to track deletion
- Use a db trigger/stored proc so that deleting automatically makes a copy of the row in some kind of audit log table.

## Testing
Since each route is actually isolated in its own file and the actual location of the file is irrelevant it's very easy to implement unit testing for each endpoint. Depending on business logic at some point we might want to look at itegration tests but for where things are at, the forced typing provides enough of an internal "contract" for programming against.

## Documentation 
We have a few ways to go about this. Since we have most of the typing information provided we can utilize TypeDoc to do some automatic generation of documentation for the API. It would allow us to generate docs for each endpoint function we're exporting with minimal overhead.

Depending on how important the documentation is (internal vs. external) I would even look at tooling like Swagger to generate a UI for exploring the API coupled with detailed docs for the endpoints.


## Containers
This doesn't containerize the main app, but does include a docker-compose file for spinning up a raw postgres container for local work. Containerizing the app is trivial but all the work around containerization is the real issue. Once you build the container, that same container should be deployed through the different environments. If you're in AWS you probably need to set up a whole other account just for centralizing the docker images and making sure they're accessible from other environment accounts.

## User Stores
### As a user, I should only report a temperature once a minute
I didn't implement this user story. The reason I didn't is because I think while the solution is trivial (leaky bucket) the scale of the deployment matters. If we're deploying a single instance of this then an in-memory leaky bucket for tracking requests is more that enough. If we have multiple instances of the server running then we need to centralize the rate limiting to ensure that you get a consistent rate limit across all node instances. We can centralize that a few ways:  
- Continue utilizing the leaky bucket but offload it to redis. We can do this in the app code itself.. but it might be better to offload this to a reverse proxy (like nginx/openresty) so that we can utilize lua+redis and allow it to deal with the rate limiting so its' not affecting the actual app.
- Offload this to the database. Since we're tracking a timestamp for each entry we can extend our composite index on the table to include the `takenDate` field and when we enter the temperature data, round down the time to the nearest minute. We could then decide if we want to throw an error or upsert the data so that only the most recent data for the minute is stored.


### [Bonus] As a user, I want to see the average, high, low, and median temperate over a specific date range
The way I implemented the current stats endpoint does calculations on the database side so extending that to include the date range is trivial. However this is not scalable.

It would be much better to keep a running count of the data. Depending on how accurate this needs to be we can go anywhere from an expoential moving average to actuall tracking all the values. I probably look at moving the actual stat counting to a different sytem like redis.

### [Bonus] As a user, I should be only able to delete, edit, and view my own temperature log.
### [Bonus] As a user, I should be only able to delete, edit, and view my own temperature log.
The authentication piece was deliberately left out because there was some ambiguity around what a "user" was.   
- The two main ways I thought it could work are there are many users assigned to a station, but each station is what submits a temperature reading. 
- A user is synonymous with a station

It also makes it a lot easier to submit/test data and validate that this is working as expected without the additional signup/authentication component to utilize the API.

In either case I think extending this for authentication is relatively easy. I would opt to add separate endpoints for creating a "station" and "authentication" which would generate some sort of token. The token itself could be JWT/OAuth/Just a UUID w/ an expiration timer that would need to be sent with every request to modify data. Actual authentication can be done either RBAC or ACL.

Since we have wrapped all the endpoints centrally, we can easily add a layer of "authentication". You'll also notice that the first argument to any of the endpoint handlers (`router.get<I, O>(options, endpoint, handler)`) is an options object. Right now it just supports input/output schema types but you could just add a further option to restrict the endpoint by permission or if ACL, giving all users full control of their data.

However, you'll notice that by default stations are given a simple role (user|admin) which allows the ability to exetnd this with a very simple change (make a station an admin, implement the actual validation that an admin is deleting records). We probably want to make sure there is some audit log if we implement an "admin" user.
