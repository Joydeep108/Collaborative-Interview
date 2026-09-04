import dotenv from "dotenv";
dotenv.config({
    path: "C:/Users/joyde/Collaborative Interview/.env"
});


import app from "./app.js";
import main from "./db/mongo.db.js";



async function initiateServer() {
    try {
        await main();
        app.listen(process.env.PORT || 8081, () => {
            console.log(`Server listen at http://localhost:${process.env.PORT}`)
        })
    } catch(err) {
        console.log(err);
        console.log(err.message);
        process.exit(1);
    }
}

initiateServer();