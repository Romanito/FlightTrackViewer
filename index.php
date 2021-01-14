<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Logs</title>
    <script src="ol/ol.js"></script>
    <link rel="stylesheet" href="ol/ol.css">
    <style>
        body {
            display: flex;
            flex-direction: column;
            padding: 0;
            margin: 0;
            height: 100vh;
        }
        header {
            display: flex;
            align-items: center;
            padding: 0.5em;
            font: small-caption;
        }
        header > * {
            margin-right: 1em;
        }
        #map {
            flex: auto;
        }
    </style>
</head>
<body>
    <header>
        <select id="traceFiles">
            <option value="0">Select a trace </option>
<?php
    foreach (array_slice(scandir('./traces/'), 2) as $file) {
        echo "<option>$file</option>";
    }
?>
        </select>
    </header>
    <div id="map"></div>
    <script src="js/osm-embed.js"></script>
</body>
</html>