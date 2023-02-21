import express from "express"
import cors from "cors"
import passport from "passport"
import session from "express-session"
import bodyParser from "body-parser";
import jwt from "jsonwebtoken"

import {User, authenticateUserLogin} from "./Authentication.js";
import mongoose from "mongoose"

import bcrypt from "bcrypt"


const app = express()
const secretKey = "mySecret"

app.use(cors({origin: ['http://localhost:3000']}))
app.use(express.json())

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}))
app.use(passport.initialize())
app.listen(13000)


app.post("/login", (req, res) => {
        const {username, password} = req.body
        User.findOne({username: username})
            .then(user => {
                if(!user) {
                    throw new Error("Unauthorized")
                }
                return user
            })
            .then(existedUser => {
                bcrypt.compare(password, existedUser.password, (err, result) => {
                    if(err) {
                        console.log(err)
                    }
                    if(!result) {
                        throw new Error("Unauthorized")
                    }
                    const token = jwt.sign({id: existedUser._id}, secretKey, {expiresIn: "60s"})
                    res.json({token: token})
                })
            })
            .catch(() => {
                res.status(401).send()
            })
    }
)

// the verification process will be completed by passport use the specified strategy and set req.user to the user
// found in database
app.get("/user", authenticateUserLogin, (req, res) => {
    if(req.user) {
        console.log("token verified, the user found in db is: " + req.user)
        res.json(req.user)
    } else {
        console.log("token verification failed, the value set for req.user is: " + req.user)
        res.status(401).send()
        console.log("code 401 has been sent")
    }
})


// when the content in request is sent in object format, it can be received by req.body
app.put("/user", async (req, res) => {
    console.log("user for update: " + JSON.stringify(req.body))
    const updatedUser = await User.findOneAndUpdate({username: req.body.username}, {notes: req.body.notes}).exec()
    res.json(updatedUser)
})


// findOne and other Queries in Mongoose are thenable so that .then can be used here. but do NOT use resolve, reject
// function here, instead, judge the value returned is null or something else, use throw new error to break .then()
// chain and catch the error in the end with catch() just as in Promise .then() chain
app.post("/register", (req, res) => {
    const {username, password} = req.body
    User.findOne({username: username})
        .then(user => {
            if (user) {
                throw new Error("User already exists")

            } else {
                console.log("create a hashed password")
                return bcrypt.hash(password, 10)
            }
        })
        .then(hashedPassword => {
            console.log("the hashed password is " + hashedPassword)
            const newUser = new User({
                username: username,
                password: hashedPassword
            })
            return newUser.save()
        })
        .then(savedUser => {
            console.log("the user " + savedUser.username + " has been saved")
            const token = jwt.sign({id: savedUser._id}, secretKey, {expiresIn: "60s"})
            res.json({token: token})
            console.log("token has been sent back to fronted after signing a user up")
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({message: err.message})
        })
})

