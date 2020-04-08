const express = require('express');
const dataRouter = require('./data/router.js');

const server = express();
server.use(express.json());

server.use('/api/posts', dataRouter);

server.listen(5000, () => {
    console.log('\n*** Server Running on http://localhost:5000 ***\n')
})