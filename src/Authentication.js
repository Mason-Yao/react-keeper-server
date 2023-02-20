import mongoose from "mongoose"
import passport from "passport"
import bcrypt from "bcrypt";
import {Strategy as LocalStrategy} from "passport-local"

mongoose.mongoose.set("strictQuery", true)
mongoose.connect("mongodb://127.0.0.1:27017/userDB")
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
passport.use(new LocalStrategy((username, password, done) => {
        // Match user
        User.findOne({ username: username })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'That email is not registered' });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            })
            .catch(err => console.log(err));
    })
);

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});

const authenticateUserLogin = passport.authenticate("local")

export {User, authenticateUserLogin}


