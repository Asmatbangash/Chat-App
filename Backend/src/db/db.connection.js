import mongoose from 'mongoose'

const dbConnectioin = async () =>{
    try {
        await mongoose.connect(process.env.DB_URI)
        console.log("database connected successfully!")
    } catch (error) {
        console.log(error)
    }
}


export default dbConnectioin;