const tolerance = 0.001;

async function getTimeoutStat(connection, trado){
    // console.log(trado.VName);
    const [rows, fields] = await connection.query('SELECT * FROM GEO_HISTORY WHERE VName = ? ORDER BY ID DESC LIMIT 1', [trado.VName]);
    if (rows === null || rows.length === 0) {
        return false;
    }
    const lonDiff = Math.abs(rows[0].Longitude - trado.Lon);
    const latDiff = Math.abs(rows[0].Latitude - trado.Lat);
    const checkTime = (new Date() - new Date(rows[0].CreatedDate)) > 10 * 60 * 1000;

    return (lonDiff <= tolerance && latDiff <= tolerance && checkTime);
}

async function getRouteStat(connection, trado){
    var isWithinRoute = false;
    const [rows, fields] = await connection.query('SELECT Lat, Lon FROM GEO_ROUTE WHERE CODE = "UOI"');
    if (rows === null || rows.length === 0) {
        return false;
    }

    for(let i = 0; i < rows.length; i++){
        const routeLat = rows[i].Lat;
        const routeLng = rows[i].Lon;

        //console.log(rows);
        // console.log(routeLat+" - "+routeLng+" - "+trado.Lat+" - "+trado.Lon);
        // console.log(Math.abs(trado.Lat - routeLat) < tolerance);
        // console.log(Math.abs(trado.Lon - routeLng) < tolerance);

        if (Math.abs(trado.Lat - routeLat) < tolerance && Math.abs(trado.Lon - routeLng) < tolerance) {
            isWithinRoute = true;
            break;
          }
    }
    return isWithinRoute;
}

async function getGarageStat(connection, trado){
    const [rows, fields] = await connection.query('SELECT Lat, Lon FROM GEO_FENCE WHERE CODE = "OAK" AND GARAGE = 1');

    return polygonCheck(trado, rows)
}

async function getDestinationStat(connection, trado){
    const [rows, fields] = await connection.query('SELECT Lat, Lon FROM GEO_FENCE WHERE CODE = "UOI" AND Destination = 1');

    return polygonCheck(trado, rows)
}

//Additional Function
function polygonCheck(trado, polygon){
  const x = trado.Lat;
  const y = trado.Lon;

  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].Lat;
    const yi = polygon[i].Lon;
    const xj = polygon[j].Lat;
    const yj = polygon[j].Lon;

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

    if (intersect) isInside = !isInside;
  }

  return isInside;
}

module.exports = {
    getRouteStat,
    getGarageStat,
    getTimeoutStat,
    getDestinationStat
    // Other exports if needed
  };