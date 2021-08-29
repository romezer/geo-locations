const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(express.json());
app.use(bodyParser.json());

require('./routes')(app);

app.listen(3001, () => {
    console.log('app started and listenenig at http://localhost:3001');
 });
 

