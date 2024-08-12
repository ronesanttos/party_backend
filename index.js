//modulos
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')

// rotas
const authRouter = require('./routers/authRoutes')
const userRouter = require('./routers/userRoutes')
const partyRouter = require('./routers/paryRoutes')

// middlewares

const verifyToken = require('./helpers/checkToken')

const nameDb = 'partytimedb'
const port = 7000

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

//rotas express
app.use("/api/auth", authRouter)
app.use("/api/user", verifyToken, userRouter)
app.use("/api/party", partyRouter)

// conexao ao mongoDB

mongoose.connect(`mongodb://localhost/${nameDb}`)

app.get("/", (req, res) => {
    res.json({ msg: "Rota teste" })
})
app.listen(port, () => {
    console.log(`Backend rodando na porta ${port}`)
})