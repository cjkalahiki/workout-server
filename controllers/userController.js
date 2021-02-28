const router = require('express').Router();
const {UserModel} = require('../models');
const {UniqueConstraintError} = require('sequelize/lib/errors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//New User
router.post('/user', async (req, res) => {
    const { username, passwordhash } = req.body;

    try {
        const User = await UserModel.create({
            username,
            passwordhash: bcrypt.hashSync(passwordhash, 13)
        })

        let token = jwt.sign({id: User.id, username: User.username}, process.env.JWT_SECRET, {expiresIn: 60*60*24});

        res.status(201).json({
            message: "User successfully created",
            user: User,
            sessionToken: token
        });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            res.status(409).json({
                message: "Username already in use"
            });
        } else {
            res.status(500).json({
                error: `Failed to create user ${err}`
            })
        }
    }
});

router.post('/login', async (req, res) => {
    let { username, passwordhash } = req.body;

    try {
        const loginUser = await UserModel.findOne({
            where: {
                username: username
            }
        });

        if (loginUser) {
            let passwordComp = await bcrypt.compare(passwordhash, loginUser.passwordhash);

            if (passwordComp) {
                let token = jwt.sign({id: loginUser.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24});

                res.status(200).json({
                    message: "Login successful",
                    username: loginUser,
                    sessionToken: token
                });
            } else {
                res.status(401).json({
                    message: "Incorrect username or password"
                })
            }
        } else {
            res.status(401).json({
                message: "Incorrect username or password"
            })
        } 
    } catch (err) {
        res.status(500).json({
            message: "Failed to log user in"
        })
    }
});

module.exports = router;