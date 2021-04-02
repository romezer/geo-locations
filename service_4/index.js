const express = require('express');

const app = express();
app.use(express.json());

require('./routes')(app);

app.listen(3004, () => {
    console.log('app started and listenenig at http://localhost:3004');
 });