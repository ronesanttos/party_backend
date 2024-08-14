const router = require('express').Router()
const jwt = require('jsonwebtoken')
const multer = require('multer')

const Party = require('../models/party')
const User = require('../models/user')

//define file storage
const diskStorage = require('../helpers/file-storage')
const upload = multer({ storage: diskStorage })

// middlewares e helpers
const verifyToken = require('../helpers/checkToken')
const getUserToken = require('../helpers/getToken')

router.post("/", verifyToken, upload.fields([{ name: "photos" }]), async (req, res) => {

    const title = req.body.title
    const description = req.body.description
    const partyDate = req.body.partyDate

    let files = []

    if (req.files) {
        files = req.files.photos
    }

    //validacoes
    if (title == "null" || description == "null" || partyDate == "null") {
        res.status(400).json({ error: "Titulo, descrição e data são campos obrigatórios!" })
    }

    //verifica usuario

    const token = req.header("auth-token")
    const userToken = await getUserToken(token)

    const userId = userToken._id.toString()

    try {
        const user = await User.findOne({ _id: userId })

        let photos = []

        if (files && files.length > 0) {
            files.forEach((photo, i) => {
                photos[i] = photo.path
            });
        }

        const party = new Party({
            title: title,
            description: description,
            partyDate: partyDate,
            photos: photos,
            privacy: req.body.privacy,
            userId: user._id.toString()
        })

        try {
            const newParty = await party.save()
            res.json({ error: null, msg: "Evento criado com sucesso", data: newParty })

        } catch (error) {
            return res.status(400).json({ error })
        }

    } catch (error) {
        return res.status(400).json({ error: "Acesso negado!" })
    }
})

//  festas publicas
router.get("/all", async (req, res) => {
    try {
        const parties = await Party.find({ privacy: false }).sort([['_id', -1]])
        return res.json({ error: null, parties: parties })

    } catch (error) {
        return res.status(400).json({ error })
    }
})

//  festas do usuario
router.get("/userparties", verifyToken, async (req, res) => {
    try {
        const token = req.header("auth-token")
        const user = await getUserToken(token)
        const userId = user._id.toString()

        const parties = await Party.find({ userId: userId })

        return res.json({ error: null, parties: parties })

    } catch (error) {
        return res.status(400).json({ error })
    }
})

// festas privadas por id
router.get("/userparty/:id", verifyToken, async (req, res) => {
    try {
        const token = req.header("auth-token")
        const user = await getUserToken(token)

        const userId = user._id.toString()
        const partyId = req.params.id

        const party = await Party.findOne({ _id: partyId, userId: userId })

        return res.json({ error: null, party: party })

    } catch (error) {
        return res.status(400).json({ error })
    }
})

// festa publicas ou do usuario por id

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id
        const party = await Party.findOne({ _id: id })

        if (party.privacy === false) {
            res.json({ error: null, party: party })
        }

        else {
            const token = req.header("auth-token")
            const user = await getUserToken(token)

            const userId = user._id.toString()
            const partyUserId = party.userId.toString()

            if (userId == partyUserId) {
                res.json({ error: null, party: party })
            }

        }
    } catch (error) {
        return res.status(400).json({ error: "Evento não encontrado!" })
    }
})

// deletar festa
router.delete("/", verifyToken, async (req, res) => {
    const token = req.header("auth-token")
    const user = await getUserToken(token)

    const partyId = req.body.id
    const userId = user._id.toString()

    try {
        await Party.deleteOne({ _id: partyId, userId: userId })

        return res.json({ error: null, msg: "Evento deletado com sucesso!" })
    } catch (error) {
        return res.status(400).json({ error: "Acesso negado!" })
    }

})

// atualizacao de festa

router.put("/", verifyToken, upload.fields([{ name: "photos" }]), async (req, res) => {
    const title = req.body.title
    const description = req.body.description
    const partyDate = req.body.partyDate
    const partyId = req.body.id
    const partyUserId = req.body.user_id

    let files = []

    if (req.files) {
        files = req.files.photos
    }

    //validacoes
    if (title == "null" || description == "null" || partyDate == "null") {
        res.status(400).json({ error: "Titulo, descrição e data são obrigatórios!" })
    }

    const token = req.header("auth-token")
    const userToken = await getUserToken(token)

    const userId = userToken._id.toString()

    if (userId != partyUserId) {
        res.status(400).json({ error: "Acesso negado!" })
    }

    //atualizar dados
    const party = {
        id: partyId,
        title: title,
        description: description,
        partyDate: partyDate,
        privacy: req.body.privacy,
        userId: userId
    }

    // atualizar fotos
    let photos = []

    if (files && files.length > 0) {
        files.forEach((photo, i) => {
            photos[i] = photo.path
        })
        party.photos = photos
    }

    try {
        const updatedParty = await Party.findOneAndUpdate({ _id: partyId, userId: userId }, { $set: party }, { new: true })

        return res.json({ error: null, msg: "Atualizado com sucesso!", data: updatedParty })

    } catch (error) {
        res.status(400).json({ error })
    }
})
module.exports = router

//exporta para o github e glitch