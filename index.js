var amqp = require('amqplib/callback_api');
//const { createClient } = require('redis')
const { MongoClient, ServerApiVersion } = require("mongodb");

// let redisURL = process.env.REDIS_DB_URI
// const client = createClient({ url: redisURL });

let actions

//setupRedis()
setupRabbitMQ()
setupMongo()

async function setupMongo() {
    let uri = process.env.MONGO_DB_URI
    console.log(uri)
    const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        }
      });
  try {
    let mongoDBName = process.env.MONGO_DB_NAME
    let dataBase = client.db(mongoDBName);
    actions = await dataBase.collection("actions")
  } finally {
  }
}

function setupRabbitMQ() {

    let userName = process.env.AMQP_USER_NAME
    let userPassword = process.env.AMQP_USER_PASSWORD
    let url = process.env.AMQP_URL

    let queue = "test"
    const opt = { credentials: require('amqplib').credentials.plain(userName, userPassword) };
    amqp.connect(url, opt, function (error0, connection) {
        if (error0) { throw error0; }
        connection.createChannel(function (error1, channel) {
            if (error1) { throw error1; }
            channel.assertQueue(queue, { durable: false });
            channel.consume(queue, function (msg) {
                console.log("RabbitMQ:", msg.content.toString());
                //client.set("key", msg.content.toString())
                actions.insertOne(JSON.parse(msg.content.toString()))
            }, {
                noAck: true
            });
        });
    });
}

async function setupRedis() {
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
}
