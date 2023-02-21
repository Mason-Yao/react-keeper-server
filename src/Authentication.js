import mongoose from "mongoose"
import passport from "passport"
import bcrypt from "bcrypt";
import {ExtractJwt, Strategy as JwtStrategy} from "passport-jwt"
import token from "jsonwebtoken"

mongoose.mongoose.set("strictQuery", true)
mongoose.connect("mongodb://127.0.0.1:27017/userDB_JWT")
const userSchema = new mongoose.Schema(
    {
        "username": {
            type: String,
            require: true
        },
        "password": {
            type: String,
            require: true
        },
        "googleId": {
            type: String
        },
        "notes": {
            type: [Object]
        }
    }
)

const User = new mongoose.model("User", userSchema)
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = "mySecret"

passport.use(new JwtStrategy(opts, (payload, done) => {
        // Match user
        User.findById(payload.id, (err, user) => {
            if (err) {
                console.log("error in strategy")
                return done(err, false);
            }
            if (user) {
                console.log("succeed in strategy")
                return done(null, user);
            } else {
                console.log("no result in strategy")
                return done(null, false);
            }
        })

    })
);



const authenticateUserLogin = passport.authenticate("jwt", {session: false})

export {User, authenticateUserLogin}


