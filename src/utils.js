const axios = require('axios');

const getCarList = ($params, cb) => {
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
};


const createLink = (car) => {
    return 'https://tr.vava.cars/buy/cars/' + car.make + '/' + car.model + '/' + car.id
}
let getStatus = (status) => {
    return status == 2 ? 'rezerve' : 'yeni'
};

module.exports = {
    getCarList: getCarList,
    createLink: createLink,
    getStatus: getStatus
}
