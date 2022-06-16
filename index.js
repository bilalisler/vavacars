const axios = require('axios');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

startCrawler = () => {
    const createLink = (car) => {
        return 'https://tr.vava.cars/buy/cars/' + car.make + '/' + car.model + '/' + car.id
    }

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
                getCarList($params, function (newCarList) {
                    let getStatus = function (status) {
                        return status == 2 ? 'rezerve' : 'yeni'
                    };
                    for (const [index, newCar] of Object.entries(newCarList)) {
                        let $link = createLink(newCar);
                        let $newStatus = newCar.status;
                        let $id = newCar.id;

                        if ($id in carStatusMap) {
                            let $oldStatus = carStatusMap[$id];
                            if($oldStatus !== $newStatus){
                                console.log($link + ' - ' + getStatus($oldStatus) + "'den " + getStatus($newStatus) + "'a çekilmiştir");
                            }
                        }else if (!oldCarIdList.includes($id) && newCar.status == 1 ) {
                            console.log($link + ' -  yeni');
                        }
                    }

                    carList = carList.concat(newCarList)
                    fs.writeFileSync(filePath, JSON.stringify(carList), {flag: 'w'}, (err) => {
                        if (err)
                            console.log(err, 'write file error2');
                    });
                });
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

const sendEmail = (carLink) => {
    let transporter = nodemailer.createTransport({
        service: 'hotmail',
        auth: {
            user: "crawlervava@outlook.com",
            pass: "Test123456789-"
        }
    })
    const options = {
        from: "crawlervava@outlook.com",
        to: "mercan_shark@windowslive.com",
        subject: "New Car in VAVA",
        text: "Please check url: " + carLink
    }
    // transporter.sendMail(options, (error, info) =>{
    //     if(error){
    //         console.log(error,'send mail error')
    //     }
    // })
}

console.log('crawler started...', (new Date()).toLocaleTimeString());
cron.schedule('* * * * *', function() {
    console.log('crawling...', (new Date()).toLocaleTimeString());
    startCrawler()
});
