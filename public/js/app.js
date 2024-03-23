async function fetchDataFromDB(connection){
    const [rows, fields] = await connection.query("SELECT Trado.VName, CASE VHC.Loc WHEN 1 THEN 'JKT' WHEN 2 THEN 'MDN' WHEN 3 THEN 'SBY' WHEN 4 THEN 'KLM' END City, GH.Latitude, GH.Longitude, GH.TimeOut, GH.InRoute, GH.InGarage, GH.InDestination FROM (SELECT VName, MAX(ID) ID FROM geo_history G GROUP BY G.VName) Trado LEFT JOIN geo_history GH ON GH.ID = Trado.ID LEFT JOIN vhc_trado VHC ON VHC.VName = GH.VName ORDER BY GH.TimeOut DESC, GH.InGarage DESC, GH.InRoute DESC");
    
    if (rows === null || rows.length === 0) {
        return [];
    }

    const dataArr = [];

    rows.forEach(row => {
        dataArr.push({
            VName : row.VName, 
            Lat : row.Latitude,
            Lon : row.Longitude,
            TimeOut : row.TimeOut === 1 ? "Yes" : "",
            InRoute : row.InRoute === 1 ? "Di Dalam" : "Di Luar",
            InGarage : row.InGarage === 1 ? "Yes" : "",
            InDestination : row.InDestination === 1 ? "UOI" : "",
            City : row.City !== null ? row.City : "",
        });  
    });

    return dataArr;
}

module.exports = {
    fetchDataFromDB
};