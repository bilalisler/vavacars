const axios = require('axios');
const fs = require('fs');

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

fs.readFile('./lastCars.json', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        var oldCarList = JSON.parse(data);

        let bookedCars = oldCarList.filter(car => { // rezerve edilmiş araçlar
            return car['status'] === 2;
        });
        let notBookedCars = oldCarList.filter(car => { // mevcut araçlar
            return car['status'] === 1;
        });

        var bookedCarIdList = bookedCars.map(car => car.id);
        var notBookedCarIdList = notBookedCars.map(car => car.id);
        var oldCarIdList = notBookedCarIdList.concat(bookedCarIdList);

        // fs.writeFile('./lastCars.json', JSON.stringify([]), {flag: 'w'}, err => {}); // sıfırla

        var carList = [];
        setTimeout(() => {
            getCarList($params, function (newCarList) {
                for (const [index, newCar] of Object.entries(newCarList)) {
                    if (!oldCarIdList.includes(newCar.id)) {
                        console.log('newCar:', newCar.id,createLink(newCar))
                    }
                }

                carList = carList.concat(newCarList)
                // fs.writeFileSync('./lastCars.json', JSON.stringify(carList), {flag: 'w'});
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
            console.log(error);
        });
}
