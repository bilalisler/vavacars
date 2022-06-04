const axios = require('axios');
const fs = require('fs');

let url = 'https://app-vava-dtc-search-tr-prod.azurewebsites.net/search'
let params = {
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

fs.readFile('./last_cars.json', (err, data) => {
    if (err) {
        console.error(err);
    } else {
        var oldCarList = JSON.parse(data);
        var oldCarIdList = oldCarList.map(car => car.id)

        getCarList(1, function (newCarList) {
            let newCarIdList = newCarList.map(car => car.id)

            console.log(newCarIdList.filter(x => !oldCarIdList.includes(x)))

            oldCarList = oldCarList.concat(newCarList)
            fs.writeFileSync('./last_cars.json', JSON.stringify(oldCarList));
        });
    }
});

getCarList = ($page, cb) => {
    params['page'] = $page;
    axios.post(url, params)
        .then(function (response) {
            let totalCount = response.data.totalCount;
            cb(response.data.items)
            if (totalCount > params['pageSize'] * $page) {
                $page++;
                getCarList($page, cb);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}
