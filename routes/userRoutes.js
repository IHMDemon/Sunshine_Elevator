const express         = require('express');
const userRouter      = express.Router();
const User            = require('../models/user');
const bcrypt 		  = require('bcryptjs')
const passport 		  = require('passport');
const ensureLogin	  = require('connect-ensure-login').ensureLoggedIn;



userRouter.get('/signup', (req, res, next) =>{
    res.render('sign-up')
});

userRouter.post('/signup', (req, res, next) => {
    // make sure the .thePassword and .theUsername equals to exactly what the 
    // value of the form name is in the sign-up.hbs file.

    const thePassword = req.body.thePassword;
    const theUsername = req.body.theUsername;
    const theUserType = req.body.userType;
    if(thePassword === "" || theUsername === ""){
        res.render('sign-up', {errorMessage: 'Please fill in both a username and password in order to create an account'})
        return;
    }
    User.findOne({'username': theUsername})
    .then((responseFromDB)=>{
        console.log('first response from DB ======================== ', responseFromDB)
        if (responseFromDB !== null){
            res.render('sign-up', {errorMessage: `Sorry, the username ${theUsername} is awesome, so you cant have it. Too late! Be a beta tester next time`})
            return;
        } 
        
        // ends the if statement

            const salt     = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(thePassword, salt);
            User.create({username: theUsername, password: hashedPassword , userType:theUserType})
            .then((response)=>{
                console.log('second response from DB >>>>>>>>>>>>>>>>>>>>>>= ', response)
                res.redirect('/');
            })
            .catch((err)=>{
                next(err);
            })
    }) // ends the .then from the user.findOne
}); // ends the route

userRouter.get('/login', (req, res, next)=>{
    res.render('login',{"message":req.flash("error")}); 
});

userRouter.post('/login', passport.authenticate("local", {
    successRedirect: "/fork",
    // need to make it when you already gave info to take you dashboard.
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
}));

userRouter.get("/fork", ensureLogin('/login'), (req,res,next)=>{
    if (req.user.userType === "admin"){
        console.log('sent me to admin Dash')
        res.redirect('/admin/dashboard')
    }else {
        res.redirect('/clientInfo')
    }

})
userRouter.get('/aboutUs', (req, res, next) =>{
    res.render('about-Us')
});


userRouter.get("/logout", ensureLogin('/'), (req, res, next)=>{
    req.logout();
    res.redirect("/")
})





module.exports = userRouter;

