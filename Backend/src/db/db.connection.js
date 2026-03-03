import mongoose from 'mongoose'

const dbConnectioin = async () =>{
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("database connected successfully!")
    } catch (error) {
        console.error(error)
        // Propagate failure so caller can terminate process intentionally.
        throw error;
    }
}


export default dbConnectioin;
