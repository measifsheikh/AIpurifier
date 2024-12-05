const { configDotenv } = require('dotenv');
const { MongoClient } = require('mongodb'); // Import the MongoClient from MongoDB driver
const readlineSync = require('readline-sync'); // Import prompt-sync for capturing user input
require(configDotenv)
// Connection URL and Database Name
const PORT = process.env.PORT
const url = process.env.url; 
const dbName = process.env.DB_NAME;
const collectionName =process.env.collectionName;

// Function to get random values within a range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Ask user for method (insert or drop collection)
const method = readlineSync.question('Enter method (insert or drop collection): ');

async function insertSensorData(entries) {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        for (let i = 0; i < entries; i++) {
            const data = {
                pm25: getRandomInt(50, 2500),
                aqi: getRandomInt(100, 5000),
                dust_density: getRandomInt(250, 10000),
                timestamp: new Date()
            };

            // Insert the data
            const result = await collection.insertOne(data);
            console.log(`Data inserted with ID: ${result.insertedId}`);

            // Delay between insertions (e.g., 4 seconds)
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    } catch (error) {
        console.error('Error inserting data:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

async function resetCollection() {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        // Drop the existing collection
        const dropResult = await collection.drop();
        console.log(`Collection ${collectionName} dropped: `, dropResult);

        // Insert new data into the collection
        const newData = {
            pm25: 30,
            aqi: 55.7,
            dust_density: 40,
            timestamp: new Date()
        };

        const insertResult = await db.collection(collectionName).insertOne(newData);
        console.log('New data inserted:', insertResult);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('MongoDB connection closed');
    }
}

// If method is "insert", ask for number of entries and insert data
if (method === "insert") {
    const value = parseInt(readlineSync.question('How many entries to insert? '), 10);
    if (isNaN(value) || value <= 0) {
        console.log('Invalid input for number of entries.');
    } else {
        insertSensorData(value);
    }
}

// If method is "drop", reset the collection
if (method === "drop") {
    resetCollection();
}
