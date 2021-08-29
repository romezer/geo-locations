const { v1 } = require('uuid');
const { Queue } = require('bullmq');
require('dotenv').config();


const myQueue = new Queue('Service_1_Queue', { connection: {
    host: process.env.REDIS_HOST,
    post: 6379
}});

module.exports = (app) => {

    app.post('/api/location', async (req, res) => {
        console.log('redis host: ', process.env.REDIS_HOST);
        const jobId = v1();
        const payload = Object.assign({}, req.body, { timeStamp: new Date(), location: { type: 'Point', coordinates: [ Number(req.body.latitude), Number(req.body.longitude) ]}});

        console.log('payload: ', payload);
        try{
            await myQueue.add(jobId, { ... payload });
            res.send(`Job inserted: ${jobId}`);
        }
        catch(error){
            res.send(error)
        }
        
    })
}