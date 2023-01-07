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

app.get('/clear-all-notifications', (req, res) => {
    fs.writeFile(notificationPath, JSON.stringify([]), {flag: 'w'}, (err) => {
        if (err)
            console.log(err, 'write file error2');
    });

    res.setHeader('Content-Type', 'application/json');
    res.json({
        'status': "OK"
    })
})

app.get('/clear-notification/:index', (req, res) => {
    let index = req.params.index;

    fs.readFile(notificationPath, (err, data) => {
        if (err) {
            console.error(err, 'file read error');
        } else {
            var notificationList = JSON.parse(data.length === 0 ? '[]' : data);
            notificationList = notificationList.filter((ix, item) => ix !== index)

            fs.writeFile(notificationPath, JSON.stringify(notificationList), {flag: 'w'}, (err) => {
                if (err)
                    console.log(err, 'write file error2');
            });

            res.setHeader('Content-Type', 'application/json');
            res.json({
                'status': "OK"
            })
        }
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}, http://localhost:${port}`)
})
