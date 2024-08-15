//modulos
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


require('dotenv').config()

// rotas
const authRouter = require('./routers/authRoutes')
const userRouter = require('./routers/userRoutes')
const partyRouter = require('./routers/paryRoutes')

// middlewares

const verifyToken = require('./helpers/checkToken')


const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

//rotas express
app.use("/api/auth", authRouter)
app.use("/api/user", verifyToken, userRouter)
app.use("/api/party", partyRouter)

// conexao ao mongoDB

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.log("Connection failed")
    }
}

connectDB()

const PORT = process.env.PORT


app.get("/", (req, res) => {
    res.json({ msg: "Rota teste" })
})
app.listen(PORT, () => {
    console.log(`Backend rodando na porta ${PORT}`)
})