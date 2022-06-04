const axios = require('axios');

let url = 'https://app-vava-dtc-search-tr-prod.azurewebsites.net/search'
let params = {
    "pageNum": 1,
    "pageSize": 12,
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

axios.post(url, params)
    .then(function (response) {
        let totalCount = response.data.totalCount;

        let cars = response.data.items;

        for(const [index,car] of Object.entries(cars)){
            console.log(car);
        }

    })
    .catch(function (error) {
        console.log(error);
    });

