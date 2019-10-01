const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const nodemailer=require('nodemailer');

const User = mongoose.model('User');


module.exports.register = (req, res, next) => {
    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.password = req.body.password;

    user.save((err, doc) => {
        if (!err)
        {
            res.send(doc);
            sendMail(user,info=>{
                console.log(`Mail has been sent and id is ${info.messageId}`);
            });
        }
            
        else {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email adrress found.']);
            else
                return next(err);
        }

    });
}

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else
                return res.status(200).json({ status: true, user : _.pick(user,['fullName','email']) });
        }
    );
}

async function sendMail(user,callback){
    let transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure :false,
        auth:{
            user: 'sender@gmail.com',
            pass: 'SenderPassword'
        }
    });

    const mailOptions = {
        from: 'sender@gmail.com', // sender address
        to: user.email, // list of receivers
        subject: 'Registration successful', // Subject line
        html: `<p>Hi ${user.fullName} Thank you for registering!</p>`// plain text body
      };
      let info =await transporter.sendMail(mailOptions);
      callback(info);
}