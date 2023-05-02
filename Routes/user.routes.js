const express = require("express");
const userRouter = express.Router();
const {redisClient} = require("../Redis/redis")
const {UserModel} = require("../model/user.model");
const jwt = require("jsonwebtoken");
require("dotenv").config()
const IP = require("ip");
const axios = require("axios");

const {authenticate} = require("../middleware/Authenticator")

const bcrypt = require("bcrypt");;

userRouter.post("/signup",(req,res)=>{

    const {name,email,password} = req.body;

    try {

        bcrypt.hash(password,5,async(err,hash)=>{

            if(err) {
                res.status(500).send("Something Wrong")
            }else{

                let user = new UserModel({name,email,password:hash});
                await user.save();

                res.status(200).send({msg:"Registration Successfully"})

            }
        })

    } catch (error) {
        res.status(500).send({msg:error})
    }

})


userRouter.post("/login",async(req,res)=>{

    try {
        
        const {email, password} = req.body;

        const isUser = await UserModel.findOne({email});

        if(!isUser){
            res.status(500).send("Signup First then Login")
        }else{

            const isPassword = await bcrypt.compareSync(password,isUser.password);

            if(!isPassword){
                return  res.status(500).send("Wromg Passsword")
            }
            
            const token = await jwt.sign({email,userID:isUser._id},process.env.JWT_TOKEN,{expiresIn:"6h"})

            const ref_token = await jwt.sign({email,userID:isUser._id},process.env.JWTREF_TOKEN,{expiresIn:"3h"})

            redisClient.SET(`${token}`,token);

            redisClient.EXPIRE(`${token}`,21600)

        }

         
    } catch (error) {
        res.status(500).send({msg:error})
    }

})


userRouter.post("/logout",authenticate,async(req,res)=>{

    const token = res.headers.authorization?.split(" ")[1];

    const tokenredis = await redisClient.GET(`${token}`)

    await redisClient.RPUSH("blacklist",tokenredis);

    res.status(200).send("Logout Successfully")

})




module.exports = {userRouter}