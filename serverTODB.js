const express = require('express');
const mysql = require('mysql2/promise'); // Import mysql2 promise-based API
const fetch = require('node-fetch');

const { getDestinationStat, getRouteStat, getGarageStat, getTimeoutStat } = require('./public/js/status');

const app = express();

const url = "https://app.tracking.web.id/gettracks_api/service.asmx/getvehicletracks?tokens=mPmavvYDK0mpH6Ft";

// MySQL Connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'sample',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0
});

// Function to fetch data from external API and store it in MySQL
const fetchDataAndStoreInDB = async () => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data from API');
    }
    const data = await response.json();
    if (!data || data.length === 0) {
      throw new Error('Received empty or null data from API');
    }

    // Store data in MySQL database
    // Example: Insert data into a table named 'data'
    const connection = await pool.getConnection();
    const query = 'INSERT INTO GEO_HISTORY (VName, Longitude, Latitude, GPSTime, TimeOut, InRoute, InGarage, InDestination) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    for (const item of data) {

        var timeOut = await getTimeoutStat(connection, item) == true ? 1 : 0;
        var InRoute = await getRouteStat(connection, item) == true ? 1 : 0;
        var InGarage = await getGarageStat(connection, item) == true ? 1 : 0;
        var InDestination = await getDestinationStat(connection, item) == true ? 1 : 0;
        await connection.query(query,  [item.VName, item.Lon, item.Lat, item.GPSTime, timeOut, InRoute, InGarage, InDestination]);

    }
    connection.release();
    console.log('Data inserted successfully.');
  } catch (error) {
    console.error('Error fetching or storing data: ', error);
  }
};

// Run the function initially
fetchDataAndStoreInDB();

// Schedule the function to run every 10 minutes (600000 milliseconds)
setInterval(fetchDataAndStoreInDB, 600000);

// Start the Express server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
