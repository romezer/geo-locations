const { Worker, Queue } = require('bullmq');
const { v1 } = require('uuid');
const axios = require('axios');
require('dotenv').config();

const myQueue = new Queue('Service_2_Queue', {connection: {
    host: process.env.REDIS_HOST,
    post: 6379
}});

const worker = new Worker('Service_1_Queue', async job => {
    const jobId = v1();
    const { latitude, longitude, user_id, timeStamp, location } = job.data;
    const response = await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=${process.env.API_KEY}&lat=${latitude}&lon=${longitude}&format=json`);
    console.log('response: ', response.data);
    const payload = Object.assign({}, { user_id, timeStamp, location }, response.data);
    console.log('service_2 payload: ', payload);
    await myQueue.add(jobId, payload);

}, {connection: {
    host: process.env.REDIS_HOST,
    post: 6379
}});

worker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job.id} has failed with ${err.message}`);
});