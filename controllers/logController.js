const router = require('express').Router();
const {LogModel} = require('../models');
const validateJWT = require('../middleware/validate-jwt');

router.post('/', validateJWT, async (req, res) => {
    const {description, definition, result} = req.body.log;
    const {id} = req.user;
    const logEntry = {
        description,
        definition,
        result,
        owner: id
    }

    try {
        const newLog = await LogModel.create(logEntry);
        res.status(200).json(newLog);
    } catch (err) {
        res.status(500).json({error: err});
    }
    LogModel.create(logEntry);
});

//Get Entries by User
router.get('/', validateJWT, async (req, res) => {
    let {id} = req.user;
    try {
        const userLogs = await LogModel.findAll({
            where: {
                owner: id
            }
        });
        res.status(200).json(userLogs);
    } catch (err) {
        res.status(500).json({error: err});
    }
});

//get individual logs by id for an individual user
router.get('/:id', validateJWT, async (req, res) => {
    const ownerId = req.user.id;
    const logId = req.params.id;

    try {
        const query = await LogModel.findAll({
            where: {
                id: logId,
                owner: ownerId
            }
        });
        res.status(200).json(query)
    } catch (err) {
        res.status(500).json({error: err});
    }
});

//update logs by a user
router.put('/:id', validateJWT, async (req, res) => {
    const {description, definition, result} = req.body.log;
    const ownerId = req.user.id;
    const logId = req.params.id;

    const query = {
        where: {
            id: logId,
            owner: ownerId
        }
    };

    const updatedLog = {
        description: description,
        definition: definition,
        result: result   
    };

    try {
        await LogModel.update(updatedLog, query);
        res.status(200).json({
            message: `Log successfully updated.`
        });    
    } catch (err) {
        res.status(500).json({error: err});
    }
});

//delete
router.delete('/:id', validateJWT, async (req, res) => {
    const ownerId = req.user.id;
    const logId = req.params.id;

    try {
        const query = {
            where: {
                id: logId,
                owner: ownerId
            }
        };

        await LogModel.destroy(query);
        res.status(200).json({
            message: "Journal entry removed."
        });
    } catch (err) {
        res.status(500).json({error: err});
    }
});

module.exports = router;