import express from "express"
import cors from "cors"
import passport from "passport"
import session from "express-session"
import bodyParser from "body-parser";
import cookieParser from "cookie-parser"
import {User, authenticateUserLogin} from "./Authentication.js";
import mongoose from "mongoose"
import passportLocalMongoose from "passport-local-mongoose"
import bcrypt from "bcrypt"
import {reject} from "bcrypt/promises.js";

const app = express()

app.use(express.json())
app.use(session({
    secret: "demopassword",
    resave: false,
    saveUninitialized: false
}))
app.use(cookieParser())
app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({extended: true}))
app.use(passport.session())
app.listen(13000)


app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}))

// mongoose.mongoose.set("strictQuery", true)
// mongoose.connect("mongodb://127.0.0.1:27017/userDB")
// const userSchema = new mongoose.Schema(
//     {
//         "userId": {
//             type: mongoose.Schema.Types.ObjectId
//         },
//         "username": {
//             type: String,
//             require: true
//         },
//         "password": {
//             type: String,
//             require: true
//         },
//         "googleId": {
//             type: String
//         },
//         "notes": {
//             type: [Object]
//         }
//     }
// )
//
// userSchema.plugin(passportLocalMongoose)
//
// const User = new mongoose.model("User", userSchema)
//
//
// passport.serializeUser(function (user, cb) {
//     process.nextTick(function () {
//         return cb(null, {
//             id: user.id,
//             username: user.username,
//             picture: user.picture
//         });
//     });
// });
//
// passport.deserializeUser(function (user, cb) {
//     process.nextTick(function () {
//         return cb(null, user);
//     });
// });

// receive the post request sent by axios in front login page, a session will be stored in backend server with value
// req.user, sessionID will be stored in cookie and sent to frontend. everytime the backend server receives request from
// frontend, it will check the sessionID and retrieve req.user and other data. req.isAuthenticated() will be true.
app.post("/login", authenticateUserLogin, (req, res) => {
        console.log("userSet" + req.user)
        res.redirect("/user")
    }
)

// user information can be sent back in this function after authentication succeeded, error code if failed.
// in some cases, like in user component, error code can be further handled to fulfill logic like redirect
app.get("/user", async (req, res) => {
        if (req.isAuthenticated()) {
            console.log("userGot: " + JSON.stringify(req.user))
            const user = await User.findById(req.user.id, ["userId", "username", "notes"]).exec()
            console.log("mark2" + user)
            res.json(user)
        } else {
            res.status(401).send()
        }
    }
)

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
        .then(result => {
            if (result) {
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
            req.login(savedUser, () => {
                console.log("Login with register user " + savedUser.username)
                authenticateUserLogin(req, res, () => {
                    res.redirect("/user")
                })
                // res.redirect("/user")
            })
        })
        .catch(err => {
            console.log(err);
            res.status(400).json({message:err.message})
        })
})

