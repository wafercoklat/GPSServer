$(document).ready(function() {
    // Preload notification sound
    const audio = new Audio('./sound/warning.mp3'); // Path to your notification sound file
    audio.load();
  
    $.get('/api/data', function(data) {
      var tableRows = '';
      console.log(data);
      data.forEach(function(item) {
        const rowColor = ((item.TimeOut === 'Yes' && (item.InDestination !== "Yes" && item.InGarage !== "Yes")) || item.InRoute !== "Yes") ? 'table-danger' : '';
  
        if (rowColor === 'table-danger') {
          // Play notification sound
          audio.play();
        }
  
        tableRows += `<tr class="${rowColor}">
          <td>${item.VName}</td>
          <td>${item.Lat}</td>
          <td>${item.Lon}</td>
          <td>${item.TimeOut}</td>
          <td>${item.InRoute}</td>
          <td>${item.InGarage}</td>
          <td>${item.InDestination}</td>
        </tr>`;
      });
      $('#dataTableBody').html(tableRows);
    });
  });
  