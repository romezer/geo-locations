const { Worker } = require('bullmq');
const { MongoClient } = require('mongodb');
const { v1 } = require('uuid');
require('dotenv').config();


const worker = new Worker('Service_2_Queue', async job => {
    const client = new MongoClient(`${process.env.MONGO_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    try{
        await client.connect();
        const db = client.db('admin');
        const collection = db.collection('geo_locations');
        const _id = v1();
        const data = Object.assign({}, { _id }, job.data);
        const { insertedId } = await collection.insertOne(data);
        console.log('insertedId: ', insertedId);
    }
    catch(err){
        console.log(err);
    }
    finally{
        client.close();
    }

}, { connection: {
    host: process.env.REDIS_HOST,
    post: 6379
}});

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});