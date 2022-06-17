const axios = require('axios');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

startCrawler = () => {
    const createLink = (car) => {
        return 'https://tr.vava.cars/buy/cars/' + car.make + '/' + car.model + '/' + car.id
    }
    let getStatus = function (status) {
        return status == 2 ? 'rezerve' : 'yeni'
    };

    let $params = {
        "pageNum": 1,
        "pageSize": 20,
        "filters": {
            "priceTo": 850000,
            "mileageTo": 40000,
            "yearFrom": 2018,
            "transmission": ["Otomatik"],
            "fuelType": [],
            "driveType": [],
            "bodyType": ["Crossover", "SUV"],
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

    var filePath = __dirname + '/lastCars.json';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err, 'file read error');
        } else {
            var oldCarList = JSON.parse(data);
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
            setTimeout(() => {
                var messageContent = '';
                getCarList($params, function (newCarList) {

                    for (const [index, newCar] of Object.entries(newCarList)) {
                        let $link = createLink(newCar);
                        let $newStatus = newCar.status;
                        let $id = newCar.id;

                        if ($id in carStatusMap) {
                            let $oldStatus = carStatusMap[$id];
                            if ($oldStatus !== $newStatus) {
                                messageContent += $link + ' - ' + getStatus($oldStatus) + "'den " + getStatus($newStatus) + "'a çekilmiştir" + '\n';
                            }
                        } else if (!oldCarIdList.includes($id) && newCar.status == 1) {
                            messageContent += $link + ' -  yeni' + '\n';
                        }
                    }

                    carList = carList.concat(newCarList)
                    fs.writeFileSync(filePath, JSON.stringify(carList), {flag: 'w'}, (err) => {
                        if (err)
                            console.log(err, 'write file error2');
                    });
                });

                console.log('messageContent: ',messageContent)
                if(messageContent){
                    // sendEmail(messageContent)
                }
            }, 3000)
        }
    });
}
getCarList = ($params, cb) => {
    let $url = 'https://app-vava-dtc-search-tr-prod.azurewebsites.net/search'
    axios.post($url, $params)
        .then(function (response) {
            let totalCount = response.data.totalCount;
            cb(response.data.items)
            if (totalCount > $params['pageSize'] * $params['pageNum']) {
                $params['pageNum']++;
                getCarList($params, cb);
            }
        })
        .catch(function (error) {
            console.log(error, 'get car list error');
        });
}

const sendEmail = (messageContent) => {
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: "vavacarnew@outlook.com",
            pass: "Test123456789-"
        }
    })
    const options = {
        from: "vavacarnew@outlook.com",
        to: "mercan_shark@windowslive.com",
        subject: "New Car List in VAVA",
        text: "Please check urls: \n" + messageContent
    }
    transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error, 'send mail error')
        }
    })
}

console.log('crawler started...', (new Date()).toLocaleTimeString());
cron.schedule('* * * * *', function () {
    console.log('crawling...', (new Date()).toLocaleTimeString());
    startCrawler()
});
