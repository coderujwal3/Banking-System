const app = require('./src/app');
require('dotenv').config()


const connectToDB = require('./src/config/db');
connectToDB();

const port = 3000
app.listen(port, () => {
    console.log(`Server is running at ${port}`);
})