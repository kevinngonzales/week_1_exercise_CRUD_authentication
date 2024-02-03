const express = require('express');

const bcrypt = require('bcrypt');

const prisma = require("../db/index")

const { v4: uuidv4 } = require('uuid');



module.exports = function (passport) {

    var router = express.Router();

    router.post("/register", async (req, res) => {
        try {
            const { email, password } = req.body;
            const userId = uuidv4().replace(/-/g, "").slice(0, 24);
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await prisma.user.create({
                data: {
                    id: userId,
                    email,
                    password: hashedPassword,
                },
            });
            req.login({ id: user.id, email: user.email }, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/dashboard");
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/dashboard', // Redirect on successful login
        failureRedirect: '/login',      // Redirect on failed login
    }));


    // for the user to logout.
    // req.logout will destroy the session that passport created
    router.post("/logout", function (req, res, next) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect("/login");
        });
    });

    return router;
}