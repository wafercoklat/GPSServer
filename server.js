// server.js

const express = require('express');
const path = require('path');
const cors = require('cors');
const { fetchData } = require('./public/js/app'); // Import the fetchData function correctly

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/data', async (req, res) => {
  try {
    const result = await fetchData(); // Use the fetchData function from app.js

    // Sort the result array based on isWithinRoute
    result.sort((a, b) => (a.StatusRute < b.StatusRute ? -1 : 1));

    // Create an HTML table
        const headHtml = `<head>
                      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-btExYaUn2rw56VGrXLNtvBNE2KfS/k1MCer/pHz9CCE1TVFs1eA9MELEd1GVFn3" crossorigin="anonymous">
                    </head>`;
        const tableRows = result.map(item => {
            const rowColor = item.StatusRute === 'Luar Rute' ? 'table-danger' : '';
            return `<tr class="${rowColor}">
                    <td>${item.VName}</td>
                    <td>${item.Lat}</td>
                    <td>${item.Lon}</td>
                    <td>${item.StatusRute}</td>
                    <td>${item.StatusGarasi}</td>
                    </tr>`;
        });

        const tableHtml = `<html>
                      <head>
                        <!-- Include the Bootstrap stylesheet link here -->
                        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
                      </head>
                      <body>
                        <table class="table">
                          <thead>
                            <tr>
                              <th>VName</th>
                              <th>Lat</th>
                              <th>Lon</th>
                              <th>Rute</th>
                              <th>Garasi</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${tableRows.join('')}
                          </tbody>
                        </table>
                      </body>
                    </html>`;

        // Send the HTML response
        res.send(tableHtml);

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
