# Installation

The library is available as an [npm package](https://www.npmjs.com/package/antidote_ts_client).
Run the following command to add it as a dependency to your project:

    npm install --save antidote_ts_client

# Usage

You can import the library into your js application using `require`:

    let antidoteClient = require('antidote_ts_client')

To connect to Antidote, use the `connect` function, which takes the port and the hostname.

    let antidote = antidoteClient.connect(8087, "localhost")

## Antidote-Objects

Objects in the database are addressed using immutable references of type `AntidoteObject`, which can be retrieved using methods on the connection object.
Each datatype supported by Antidote has its own method.
For example a reference to a set datatype stored under key "users" can be retrieved as follows:

    let userSet = antidote.set("users")

## Reading objects

Each `AntidoteObject` has a read method, which retrieves the current value of the object from the database.
The result is returned as a `Promise`, so the `then` method can be used to execute some action when the result is available:

    userSet.read().then(users => {
        // do something with the list of users
    }

For reading multiple objects simultaneously, the Antidote connection object provides a `read` method, which takes a list of objects to read.

## Updating objects

Each `AntidoteObject` has one or more methods to create update operations.
These update operations can be commited to the database, using the `update` method on the connection object, which takes a single update operation or a list of update operations.

    antidote.update(
        userSet.add(username)
    ).then(resp => 
        // stored successfully
    )

Note that `userSet.add(username)` just creates the operation, but does **not** execute it.
It is only executed when passed to the `antidote.update` method.

## Use with async-await

All operations are asynchronous and return Promises.
With recent versions of JavaScript, or with compilation using Babel or TypeScript it is possible to use the API with `async` and `await` to make it more readable.

    let users = await userSet.read()
    // do something with the list of users
    await antidote.update(
        userSet.add(username)
    )
    // stored successfully



## Buckets

Keys in Antidote are grouped into so called buckets.
The currently used bucket is stored in the `defaultBucket` field of the connection object.
The default value is "default-bucket", but the field can be overwritten to use different buckets. 


## Serialization

When JavaScript objects are stored in Antidote, they have to be converted to binary data.
When reading the object, the binary data has to be converted back to JavaScript.

This is done using the `jsToBinary` and `binaryToJs` methods on the connection object.
By default [MessagePack](http://msgpack.org) is used.
The behavior can be adjusted by overriding the two methods.


## Session guarantees

To ensure session guarantees like "read your writes" Antidote uses vector clocks.
Each operation returns a vector clock indicating the time after the operation.
At each request to Antidote a vector clock can be given to force a minimum time for the snapshot used in the request.

This library always stores the latest returned vector clock in the `lastCommitTimestamp` field of the connection.

When a transaction or operation is started the vector clock in the `minSnapshotTime` field is used as the minimum snapshot time.
When `monotonicSnapshots` is set to `true`, the clock of `minSnapshotTime` will automatically be updated if `lastCommitTimestamp` is updated.



## Transactions


A transaction can be started with the `startTransaction` method on the connection object.
This gives a transaction object, which provides a similar interface to the main `antidote` connction object.
In addition there is a `commit` method to commit the transaction.


    let tx = await antidote.startTransaction()
    // create object reference bound to the transaction:
    let reg = tx.multiValueRegister<number>("some-key");
    
    // read the register in the transaction:
    let vals = await reg.read();
    
    // update the register based on current values 
    let newval = f(vals) 
    await tx.update(
        reg.set(newval)
    )
    await tx.commit()


# Develop
  
To build and compile the library execute:

    npm install
    npm run compile
   
Tests are written in Mocha and can be found in `src/tests.ts`.
To execute the tests, start Antidote and then run the tests via npm: 

    # Start Antidote using Docker
    docker run -d --name antidote --restart always -p "4368:4368" -p "8085:8085" -p "8087:8087" -p "8099:8099" -p "9100:9100" -e NODE_NAME=antidote@127.0.0.1 mweber/antidotedb
    # Run Tests
    npm test
   
