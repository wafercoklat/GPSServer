// server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { fetchDataFromDB } = require('./public/js/app'); // Import the fetchData function correctly
const fs = require('fs');
const wav = require('node-wav');
const Speaker = require('speaker');


const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '192.168.100.94'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'sample'
});

// 

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

let soundPlayed = false;

// Define a function to play the sound once
function playNotificationSound(volume) {
  if (!soundPlayed) {
      const soundFilePath = './sound/warning.wav'; // Replace '/path/to/notification-sound.wav' with the actual path to your sound file

      // Read the WAV file
      const buffer = fs.readFileSync(soundFilePath);
      const audioData = wav.decode(buffer);

      // Create a Speaker instance to play audio
      const speaker = new Speaker({
          channels: audioData.channelData.length,
          bitDepth: audioData.bitDepth,
          sampleRate: audioData.sampleRate,
          volume: volume // Adjust volume as needed (0.0 to 1.0)
      });

      // Play the audio
      speaker.write(Buffer.from(audioData.channelData[0]));

      soundPlayed = true;
  }
}

app.get('/api/data', async (req, res) => {
  try {
    const result = await fetchDataFromDB(pool); // Use the fetchData function from app.js

    // Sort the result array based on isWithinRoute
    result.sort((a, b) => (a.StatusRute < b.StatusRute ? -1 : 1));

    // Create an HTML table
    const tableRows = result.map(item => {
      var rowColor = '';

      if (item.InGarage !== "Yes") {
        if (item.InDestination !== "UOI") {
          rowColor = item.TimeOut === 'Yes' || item.InRoute !== "Di Dalam" ? 'table-danger' : '';
        }
      }

      return `<tr class="${rowColor}">
              <td>${item.VName}</td>
              <td>${item.City}</td>
              <td>${item.Lat}</td>
              <td>${item.Lon}</td>
              <td>${item.TimeOut}</td>
              <td>${item.InRoute}</td>
              <td>${item.InGarage}</td>
              <td>${item.InDestination}</td>
              </tr>`;
    });

    const tableHtml = `<html>
                       <head>
                         <!-- Include the Bootstrap stylesheet link here -->
                         <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                         <style>
                           .table-container {
                             height: 700px; /* Set a fixed height for the table container */
                             overflow-y: auto; /* Enable vertical scrolling */
                           }
                           .sticky-header th {
                             position: sticky;
                             top: 0;
                             z-index: 1;
                             background-color: #fff; /* Optional: set the background color of the sticky header */
                             cursor: pointer; /* Change cursor to pointer for clickable headers */
                           }
                         </style>
                       </head>
                       <body>
                         <div class="table-container">
                           <input type="text" id="filterInput" placeholder="Search...">
                           <table class="table">
                             <thead class="sticky-header">
                               <tr>
                                 <th onclick="sortTable(0)">Trado</th>
                                 <th onclick="sortTable(1)">City</th>
                                 <th onclick="sortTable(2)">Latitude</th>
                                 <th onclick="sortTable(3)">Longitude</th>
                                 <th onclick="sortTable(4)">Timeout</th>
                                 <th onclick="sortTable(5)">InRoute</th>
                                 <th onclick="sortTable(6)">InGarage</th>
                                 <th onclick="sortTable(7)">InDestination</th>
                               </tr>
                             </thead>
                             <tbody id="tableBody">
                               ${tableRows.join('')}
                             </tbody>
                           </table>
                         </div>
                         <script>
                           // Filter table rows based on input
                           document.getElementById('filterInput').addEventListener('keyup', function() {
                             const filterValue = this.value.toLowerCase();
                             const rows = document.querySelectorAll('#tableBody tr');
                             
                             rows.forEach(row => {
                               let found = false;
                               row.querySelectorAll('td').forEach(cell => {
                                 if (cell.textContent.toLowerCase().includes(filterValue)) {
                                   found = true;
                                 }
                               });
                               
                               if (found) {
                                 row.style.display = '';
                               } else {
                                 row.style.display = 'none';
                               }
                             });
                           });

                           // Sort table rows based on selected column
                           function sortTable(columnIndex) {
                             const table = document.querySelector('.table');
                             const rows = Array.from(document.querySelectorAll('#tableBody tr'));
                             
                             const sortedRows = rows.sort((a, b) => {
                               const cellA = a.querySelectorAll('td')[columnIndex].textContent.toLowerCase();
                               const cellB = b.querySelectorAll('td')[columnIndex].textContent.toLowerCase();
                               
                               return cellA.localeCompare(cellB);
                             });
                             
                             // Clear existing table body
                             const tbody = document.getElementById('tableBody');
                             while (tbody.firstChild) {
                               tbody.removeChild(tbody.firstChild);
                             }
                             
                             // Append sorted rows to table body
                             sortedRows.forEach(row => {
                               tbody.appendChild(row);
                             });
                           }
                         </script>
                       </body>
                     </html>`;

    // Send the HTML response
    res.send(tableHtml);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Refresh the data every 10 minutes
const interval = setInterval(async () => {
  try {
      const result = await fetchDataFromDB(pool);
      // Assuming 'fetchDataFromDB' fetches data from the database
      // You can replace it with the appropriate function

      // Update any data or perform any other operation as needed

  } catch (error) {
      console.error('Error refreshing data:', error);
  }
}, 10 * 60 * 1000); // 10 minutes in milliseconds

// Ensure to clear the interval when the server shuts down
process.on('exit', () => {
  clearInterval(interval);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
