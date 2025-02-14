import connectDB from "./db/indexdb.js";
import dotenv from 'dotenv'
import app from "./app.js";

dotenv.config({
    path: './.env'
})



connectDB()
.then(()=>{
   
    const PORT = process.env.PORT || 3000; // Add this line

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`); // Update this line
    });
   
})
.catch((error )=>(console.error('Error in conneting server at intdex.js file ',   error)))