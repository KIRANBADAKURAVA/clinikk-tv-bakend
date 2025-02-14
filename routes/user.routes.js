import {Router} from 'express'
import {  
    userRegistration,
    loginUser,
    logoutUser,
    updatePassword,
    getCurrentUser,
    updateAccountDetails,
    getWatchHistory,
    toggleSubscription
}       from '../controllers/user.controller.js'

import { Tokenverification } from '../middlewares/auth.middleware.js'

const UserRouter =Router() 

UserRouter.route('/register').post(userRegistration)

UserRouter.route('/login').post(loginUser)

UserRouter.route('/logout').post(Tokenverification,logoutUser)

UserRouter.route('/toggleSubscription').post(Tokenverification,toggleSubscription)

UserRouter.route('/updatepassword').put(Tokenverification,updatePassword)

UserRouter.route('/getuser').get(Tokenverification,getCurrentUser)

UserRouter.route('/updateprofile').patch(Tokenverification, updateAccountDetails)

UserRouter.route('/watchhistry').get(Tokenverification,getWatchHistory)


export default UserRouter