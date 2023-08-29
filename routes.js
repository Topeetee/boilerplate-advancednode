const bcrypt = require("bcrypt");
const passport = require('passport')
const express = require("express");
const myDB = require('./connection');
const router = express.Router();
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;


function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
};
function setupRoutes(router,myDataBase) {
router.get("/", async (req, res) => {
    // Change the response to render the Pug template
    try {
        res.render('index', {
            title: 'Connected to Database',
            message: 'Please login',
            showLogin: true,
            showRegistration: true,
            showSocialAuth: true
        });
    } catch (error) {
        console.error(error)
    }

});
router.post('/register', async (req, res, next) => {
    try {
        const hash = bcrypt.hashSync(req.body.password, 12);

        const user = await myDataBase.findOne({ username: req.body.username });
        if (user) {
            return res.redirect('/');
        }

        const insertResult = await myDataBase.insertOne({
            username: req.body.username,
            password: hash
        });

        // Get the inserted document
        const insertedDoc = insertResult.ops[0];

        // Authenticate the user
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect('/');
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                return res.redirect('/profile');
            });
        })(req, res, next);
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});


router.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    try {
        console.log('User ' + req.body.username + ' attempted to log in.');
        res.redirect('/profile'); // Redirect to the profile page
    } catch (error) {
        console.error(error)
    }
});
router.get('/profile', ensureAuthenticated, (req, res) => {
    try {
        res.render('profile', { username: req.user.username });
    } catch (error) {
        console.error(error)
    }

});

router.get("/logout", (req, res) => {
    try {
        req.logout();
        res.redirect('/');
    } catch (error) {
        console.error(error)
    }

})
router.get('/auth/github', passport.authenticate('github'));
router.get('/auth/github/callback',passport.authenticate('github', { failureRedirect: '/cannot' }),
  (req, res) => {
    // GitHub authentication successful, redirect to profile
    res.redirect('/profile');
  }
);

router.get("/cannot",(req,res)=>{
    res.send("cannot work")
})
}
module.exports = setupRoutes;

