import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

// cors 
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Explicitly allow methods
    allowedHeaders: ["Content-Type", "Authorization"] // Specify allowed headers
  }));

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
