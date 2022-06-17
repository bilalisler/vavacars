const fs = require('fs');
const express = require('express')
const app = express()
const port = 3000

var notificationPath = __dirname + '/../notifications.json';

app.get('/', (req, res) => {
    fs.readFile(notificationPath, (err, data) => {
        if (err) {
            console.error(err, 'file read error');
        } else {
            var notificationList = JSON.parse(data.length === 0 ? '[]' : data);

            res.setHeader('Content-Type', 'application/json');
            res.json(notificationList)
        }
    });


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}, http://localhost:${port}`)
})
