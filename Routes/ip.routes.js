const express = require("express");
require("dotenv").config()
const ipRoutes = express.Router()
const axios = require("axios");

const {redisClient} = require("../Redis/redis")
const URL = 'https://ipgeolocation.abstractapi.com/v1/?api_key=' + process.env.API_KEY;



ipRoutes.get('/ipinfo', (req, res) => {

    const IP = req.body
    const sendAPIRequest = async (IP) => {
        const apiResponse = await axios.get(URL + "&ip_address=" + IP);
        redisClient.SET(`${City}`,apiResponse.result.city)
        return apiResponse.result;
    }

    const ipAddressInformation = sendAPIRequest(IP);
    res.status(200).send(ipAddressInformation)

});





module.exports = {
    ipRoutes
}