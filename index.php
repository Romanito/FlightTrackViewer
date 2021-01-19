<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Tracks</title>
    <script src="js/jszip.min.js"></script>
    <script src="ol/ol.js"></script>
    <script src="ol/kmz.js"></script>
    <link rel="stylesheet" href="ol/ol.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
    <header>
        <select id="trackFiles">
            <option value="">Select a track </option>
<?php
    foreach (array_slice(scandir('./tracks/'), 2) as $file) {
        echo "<option>$file</option>";
    }
?>
        </select>
        <select id="tileSources">
            <option value="OSM">OpenStreetMap</option>
            <option value="BingMaps">Bing Maps Satellite</option>
            <option value="Stamen">Stamen Terrain</option>
        </select>
        <span id="statusMessage"></span>
    </header>
    <div id="map"></div>
    <script src="js/bing-map-key.js"></script>
    <script src="js/osm-embed.js"></script>
    <div id="credits" style="display:none">
        <div>Icon made by <a href="http://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/free-icon/hat_996270" title="Flaticon">www.flaticon.com</a></div>
        <div>Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.</div>
    </div>

</body>
</html>