const fs = require('fs');
const cron = require('node-cron');
const utils = require('./utils')
const {trigger_time} = require('./../config')

var filePath = __dirname + '/../lastCars.json';
var notificationPath = __dirname + '/../notifications.json';

function startCrawler() {
    console.log('crawling...', (new Date()).toLocaleString());
    let $params = {
        "pageNum": 1,
        "pageSize": 20,
        "filters": {
            "priceTo": 350000,
            "mileageTo": 600000,
            "yearFrom": 2013,
            "transmission": [],
            "fuelType": [],
            "driveType": [],
            "bodyType": [],
            "doorCount": [],
            "seatingCapacity": [],
            "carFeaturesCodes": [],
            "color": [],
            "locationCity": [],
            "tags": [],
            "hideBooked": false,
            "anyBooked": false
        }
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err, 'file read error');
        } else {
            var oldCarList = JSON.parse(data.length === 0 ? '[]' : data);
            var oldCarIdList = oldCarList.map(car => car.id);

            var carStatusMap = {};
            for (const [index, item] of Object.entries(oldCarList)) {
                carStatusMap[item.id] = item.status;
            }

            fs.writeFile(filePath, JSON.stringify([]), {flag: 'w'}, (err) => {
                if (err)
                    console.log(err, 'write file error1');
            }); // sıfırla

            var carList = [];
            var notificationList = [];
            utils.getCarList($params, function (newCarList) {

                for (const [index, newCar] of Object.entries(newCarList)) {
                    let $link = utils.createLink(newCar);
                    let $newStatus = newCar.status;
                    let $id = newCar.id;


                    if ($id in carStatusMap) {
                        let $oldStatus = carStatusMap[$id];
                        if ($oldStatus !== $newStatus) {
                            notificationList = notificationList.concat([{
                                'link': $link,
                                'title': utils.getStatus($oldStatus) + "'den " + utils.getStatus($newStatus) + "'a çekilmiştir"
                            }]);
                        }
                    } else if (!oldCarIdList.includes($id) && newCar.status == 1) {
                        notificationList = notificationList.concat([{'link': $link, 'title': 'yeni'}]);
                    }

                    fs.writeFileSync(notificationPath, JSON.stringify(notificationList), {flag: 'w'}, (err) => {
                        if (err)
                            console.log(err, 'write file error2');
                    });
                }

                carList = carList.concat(newCarList);
                fs.writeFileSync(filePath, JSON.stringify(carList), {flag: 'w'}, (err) => {
                    if (err)
                        console.log(err, 'write file error2');
                });
            });
        }
    });
}

startCrawler();
cron.schedule('*/' + trigger_time + ' * * * *', function () {
    startCrawler()
});

