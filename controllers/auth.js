const mongoose = require('mongoose')
const User = require('../models/User')
const bcrypt = require('bcryptjs')

exports.register = async (req, res) => {
    const { username, password1, password2 } = req.body

    if(password1.length < 4 || password1 !== password2) {
        req.flash('errors', 'Password length must be greater than 4')
        return res.redirect('/register')
    }

    User.findOne({ username })
    .then((savedUser) => {
        if(savedUser) {
            req.flash('errors', 'Username already taken!')
            return res.redirect('/register')
        }

        bcrypt.hash(password1, 12)
        .then(hashedpassword => {
            const user = new User({
                username,
                password: hashedpassword
            });
    
            user.save((err, docs) => {
                if(err) {
                    req.flash('errors', 'Something went wrong!')
                    res.redirect('/register')
                } else {
                    req.flash('success', 'Account created! You can login now.')
                    res.redirect('/login')
                }
            })
        })
    })
    .catch(err => {
        req.flash('errors', 'Something went wrong!')
        res.redirect('/register')
    })
}

exports.login = async (req, res) => {
    const { username, password } = req.body

    await User.findOne({ username })
    .then(savedUser => {
        if(!savedUser) {
            req.flash('errors', 'Invalid credentials!')
            return res.redirect('/login')
        }

        bcrypt.compare(password, savedUser.password)
        .then(doMatch => {
            if(doMatch) {
                req.session.user = savedUser
                res.redirect('/dashboard')
            }
            else {
                req.flash('errors', 'Invalid credentials!')
                res.redirect('/login')
            }
        })
        .catch(err => {
            req.flash('errors', 'Something went wrong!')
            res.redirect('/login')
        })
    })
}

exports.logout = async (req,res) => {
    if(req.session.user && req.cookies.user_sid) {
        req.session.destroy(function() {
            res.clearCookie("user_sid")
            res.redirect('/') 
        })
    } else { 
        res.redirect('/login')
    }
}