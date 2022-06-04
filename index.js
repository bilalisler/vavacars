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
        var oldCarIdList = oldCarList.map(car => car.id)

        fs.writeFile('./lastCars.json', JSON.stringify([]), {flag: 'w'}, err => {
        }); // sıfırla

        var carList = [];
        setTimeout(() => {
            getCarList($params, function (newCarList) {
                let newCarIdList = newCarList.map(car => car.id)

                let diff = newCarIdList.filter(x => !oldCarIdList.includes(x));

                console.log(diff);

                carList = carList.concat(newCarList)
                fs.writeFileSync('./lastCars.json', JSON.stringify(carList), {flag: 'w'});
            });
        }, 3000)
    }
});

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
