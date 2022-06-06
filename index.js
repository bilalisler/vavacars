const axios = require('axios');
const fs = require('fs');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: "crawlervava2@outlook.com",
        pass: "Test123456789-"
    }
})


let $url = 'https://app-vava-dtc-search-tr-prod.azurewebsites.net/search'
let $params = {
    "pageNum": 1,
    "pageSize": 20,
    "filters": {
        "priceTo": 850000,
        "mileageTo": 90000,
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

var filePath = '/Users/bilal/Desktop/vava2/lastCars.json';

console.log('crawler started...',(new Date()).toLocaleTimeString());

fs.readFile(filePath, (err, data) => {
    if (err) {
        console.error(err,'file read error');
    } else {
        var oldCarList = JSON.parse(data);
        var oldCarIdList = oldCarList.map(car => car.id);

        fs.writeFile(filePath, JSON.stringify([]), {flag: 'w'}, (err) => {
            if (err)
                console.log(err,'write file error1');
        }); // sıfırla

        var carList = [];
        setTimeout(() => {
            getCarList($params, function (newCarList) {
                for (const [index, newCar] of Object.entries(newCarList)) {
                    if (!oldCarIdList.includes(newCar.id)) {
                        console.log(createLink(newCar));
                        sendEmail(createLink(newCar));
                    }
                }

                carList = carList.concat(newCarList)
                fs.writeFileSync(filePath, JSON.stringify(carList), {flag: 'w'}, (err) => {
                    if (err)
                        console.log(err,'write file error2');
                });
            });
        }, 3000)
    }
});

const createLink = (car) => {
    return 'https://tr.vava.cars/buy/cars/' + car.make + '/' + car.model + '/' + car.id
}

getCarList = ($params, cb) => {
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
            console.log(error,'get car list error');
        });
}


const sendEmail = (carLink) => {
    const options = {
        from : "crawlervava@outlook.com",
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
