import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// cors 
app.use(cors({
    origin: "https://clinnik-tv-frontend-k6fn.vercel.app/",
    credentials: true
}))

//json 
app.use(express.json({
    limit: '16kb'
}))

//url

app.use(express.urlencoded({
    extended:true,
    limit: '16kb'
}))


//cache
app.use(express.static('public'))

app.use(cookieParser())

// router import 
import UserRouter from './routes/user.routes.js'
import ContentRouter from './routes/content.routes.js'
import PlaylistRouter from './routes/playlist.routes.js'

//routing 
app.use('/api/v1/user', UserRouter)
app.use('/api/v1/content', ContentRouter)
app.use('/api/v1/playlist', PlaylistRouter)



export default app
