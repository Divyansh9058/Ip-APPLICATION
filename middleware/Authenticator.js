const express = require("express");
const jwt = require("jsonwebtoken");

const {redisClient} = require("../Redis/redis");


const authenticate = async (req,res,next)=>{

    if(!req.headers.authorization){
        return res.status(500).send("Please Login AGain");
    }   
    
    const token = req.headers.authorization.split(" "[1]);

    const tokenredis = await redisClient.GET(`${token}`);

    if(!tokenredis || !token || token !==tokenredis){
            return res.status(500).send({msg:"Please Login Again"});
    }

    const blacklisteddata = redisClient.LRANGE("blacklist",0,-1)

    if((blacklisteddata).includes(token)){
        return res.status(500).send({msg:"Please Login Again"});
    }

    jwt.verify(token,process.env.JWT_TOKEN,(err,decoded)=>{
        
        if(err){
            return res.status(500).send({msg:"Please Login Again"})
        }else{
            next()
        }

    })

}


module.exports = {authenticate}