const express = require("express");
const {connection} = require("./Config/db")
require("dotenv").config();
const {userRouter}  = require("./Routes/user.routes");
const {ipRoutes} = require("./Routes/ip.routes")
const {authenticate} = require("./middleware/Authenticator")
const app = express();
app.use(express.json());
const winston = require("winston")
require("winston-mongodb")
const expresswinston = require("express-winston");


app.use(expresswinston.logger({
    transports: [
        new winston.transports.MongoDB({
            level:"silly",
            db:process.env.winstondb,
            json:true
        })
    ],

    format:winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )

}))

app.use("/IPLOG",userRouter)
app.use(authenticate)
app.use("/checkip",ipRoutes)

app.listen(process.env.PORT,async()=>{

try {
    await connection
    console.log("Connected to DB")
} catch (error) {
    console.log("something error")
}

})
