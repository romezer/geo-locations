const { MongoClient } = require('mongodb');
require('dotenv').config();
let moment = require('moment');

module.exports = async (app) => {

    const client = new MongoClient(`${process.env.MONGO_URI}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    await client.connect();
    const db = client.db('admin');
    const collection = db.collection('geo_locations');
    collection.createIndex( { location : "2dsphere" } )

    app.get('/api/locations/user/:id', async (req, res) => {
        
        try{
            await client.connect();
            const db = client.db('admin');
            const collection = db.collection('geo_locations');
            const response = await collection.find({ user_id: req.params.id}).toArray();
            console.log('response: ', response);
            res.send(response);
        }
        catch(err){
            console.log(err);
        }
        
    })

    app.get('/api/locations/user/:id/daysback/:time_frame', async (req, res) => {
        try{
            const { id, time_frame } = req.params;
            const timeBackWindow = Number(time_frame);
            await client.connect();
            const db = client.db('admin');
            const collection = db.collection('geo_locations');
            const response = await collection.find({ 
                user_id: id,
                timeStamp: { $gte: moment().subtract(timeBackWindow, 'days')}
            }).toArray();
            console.log('response: ', response);
            res.send(response);
        }
        catch(err){
            console.log(err);
        }
    })

    app.get('/api/locations/popular', async (req, res) => {
        try{
            await client.connect();
            const db = client.db('admin');
            const collection = db.collection('geo_locations');
            const response = await collection.aggregate([
                {"$group": { _id: "$place_id", name: { $first: '$display_name' }, count: { $sum:1 }}},
                { $sort : { count : -1 } },
                { $limit : 3 }
            ]).toArray()
            console.log('response: ', response);
            res.send(response);
        }
        catch(error){
            console.log(error);
            res.send(error);
        }
    })

    app.get('/api/lications/find/user/:id/radius/:r', async (req, res) => {
        try{
            const { id, r } = req.params;
            await client.connect();
            const db = client.db('admin');
            const collection = db.collection('geo_locations');
            const userLastLocation = await collection.find({
                user_id: id
            })
            .sort({ timeStamp: -1})
            .limit(1)
            .toArray()

            const usrLastCoordinates = userLastLocation[0].location.coordinates;
            const lat = Number(usrLastCoordinates[0]);
            const lon = Number(usrLastCoordinates[1]);

            
            

            const response = await collection.find ({
                location: {
                   $near: {
                     $geometry: {
                        type: "Point" ,
                        coordinates: [ lat,lon]
                     },
                     $maxDistance: Number(r),
                     $minDistance: 0
                   }
                 }
              })
              .toArray()
              
              console.log('response: ', response);
              res.send(response);
        }
        catch(error){
            console.log(error);
            res.send(error);
        }
    })
}