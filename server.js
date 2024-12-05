const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT;
const url = process.env.url;
const collectionName =process.env.collectionName;


const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json())

app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS
app.use(cors());




mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define a schema and model for sensor data
const sensorDataSchema = new mongoose.Schema({
    pm25: Number,
    aqi: Number,
    dust_density: Number,
    timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model(collectionName, sensorDataSchema);

app.get('/', function(req, res) {
    // This route will be served from the static directory
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
  });

// API Endpoint to Fetch the Latest Data
app.get('/data', async (req, res) => {
    try {
        const latestData = await SensorData.findOne().sort({ timestamp: -1 }); // Get the latest record
        if (!latestData) {
            return res.status(404).json({ message: 'No data found' });
        }
        res.json(latestData);
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/last7days', async (req, res) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const data = await db.collection(collectionName)
            .aggregate([
                {
                    $match: {
                        timestamp: { $gte: sevenDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        avgPm25: { $avg: "$pm25" },
                        avgAqi: { $avg: "$aqi" },
                        avgDustDensity: { $avg: "$dust_density" }
                    }
                },
                { $sort: { _id: 1 } }
            ])
            .toArray();

        const response = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            const dayData = data.find(d => d._id === formattedDate) || null;
            return {
                date: formattedDate,
                avgPm25: dayData ? dayData.avgPm25 : null,
                avgAqi: dayData ? dayData.avgAqi : null,
                avgDustDensity: dayData ? dayData.avgDustDensity : null
            };
        }).reverse();

        res.json(response);
    } catch (error) {
        console.error('Error fetching data for the last 7 days:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
