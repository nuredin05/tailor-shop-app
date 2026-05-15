const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...')
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    } catch (error) {
        console.error('❌ MongoDB Connection Error!')
        console.error(`Message: ${error.message}`)
        if (error.message.includes('ECONNREFUSED')) {
            console.error('TIP: Your IP address might not be whitelisted in MongoDB Atlas.')
        }
        process.exit(1)
    }
}

module.exports = connectDB