var pageTitle = "Flight Tracks"
var map = null;
var trackLayer = null;
var statusMessage = document.getElementById("statusMessage");
var savedView = null;

// trackFiles selection box
var trackFiles = document.getElementById("trackFiles");
trackFiles.addEventListener("change", e => {
    history.pushState(null, null, "?track=" + trackFiles.value);
    loadSelectedTrack();
});

// trackFiles selection box
var tileSources = document.getElementById("tileSources");
tileSources.addEventListener("change", e => {
    // Saves the current view
    savedView = map.getView();
    // Erases the current map and recreates it with the new tile source
    map = null;
    let mapDiv = document.getElementById("map");
    while (mapDiv.firstChild) mapDiv.removeChild(mapDiv.firstChild);
    loadSelectedTrack();
    // Saves the preference
    localStorage.tileSource = tileSources.value;
});

// Enables navigating tracks via history
window.addEventListener("popstate", e => {
    setTrackFromQuerystring();
});

loadPreferences();
setTrackFromQuerystring();

// Loads preferences (duh)
function loadPreferences() {
    tileSources.value = localStorage.tileSource || "OSM";
}

// Reads the query string and sets the trackFiles value
function setTrackFromQuerystring() {
    let trackFile = getQueryStringParams()["track"];
    trackFiles.value = trackFile || "";
    loadSelectedTrack();
}

// Converts the query string to an associative array
function getQueryStringParams() {
    let query = location.search;
    return query
        ? (/^[?#]/.test(query) ? query.slice(1) : query)
            .split('&')
            .reduce((params, param) => {
                let [key, value] = param.split('=');
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                return params;
            }, {})
        : {};
};

// Loads the selected track to the map
function loadSelectedTrack() {

    statusMessage.textContent = "";

    // Clears existing layer
    if (trackLayer != null) {
        map?.removeLayer(trackLayer);
        trackLayer = null;
    }

    // Selected track file
    let trackFile = trackFiles.value;
    document.title = trackFile ? pageTitle + " | " + trackFile : pageTitle;
    if (!trackFile)
        return;

    // Track format depends on file extension
    let trackFormat, formatOptions = { extractStyles: false, showPointNames: false };
    if (trackFile.endsWith(".kml"))
        trackFormat = new ol.format.KML(formatOptions);
    else if (trackFile.endsWith(".kmz"))
        trackFormat = new KMZ(formatOptions);
    else if (trackFile.endsWith(".gpx"))
        trackFormat = new ol.format.GPX(formatOptions);
    else {
        alert("Unsupported file format");
        return;
    }

    statusMessage.textContent = "Loading...";

    // Layer source (refers track file)
    /*let layerSource;
    if (trackFile.endsWith(".kmz")) {
        layerSource = new ol.source.Vector({
            format: trackFormat,
            // KMZ loader
            loader: function(extent, resolution, projection) {
                let onError = function() {
                    layerSource.removeLoadedExtent(extent);
                }
                fetch("tracks/" + trackFile)
                .then(response => {
                    if (response.ok) {
                        return response.blob();
                    }
                    else
                        onError();
                })
                .then(blob => {
                    return blob.arrayBuffer();
                })
                .then(data => {
                    let zip = new JSZip();
                    zip.load(data);
                    let kmlFile = zip.file(/.kml$/i)[0];
                    if (kmlFile) 
                        layerSource.addFeatures(layerSource.getFormat().readFeatures(kmlFile.asText().substring(1)));
                    else
                        onError();                    
                })
                .catch(() => onError);
              }
        });
    }
    else {
        layerSource = new ol.source.Vector({
            format: trackFormat,
            url: "tracks/" + trackFile
        });
    }*/


    // Layer source (refers track file)
    let layerSource = new ol.source.Vector({
        url: "tracks/" + trackFile,
        format: trackFormat
    });

    // Track stroke style
    let layerStyle = [
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#163b56',
                width: 5,
            })
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3a96dd',
                width: 3,
            })
        })
    ];

    // Track layer
    trackLayer = new ol.layer.Vector({
        source: layerSource,
        style: layerStyle
    });

    // Departure / arrival icons
    let styleDeparture = new ol.style.Style({ text: new ol.style.Text({ text: "🛫", scale: [3, 3] }) });
    let styleArrival = new ol.style.Style({ text: new ol.style.Text({ text: "🛬", scale: [3, 3] }) });

    // Tile source
    let tileSource;
    switch (tileSources.value) {
        case "BingMaps":
            tileSource = new ol.source.BingMaps({
                key: bingMapKey,
                imagerySet: 'AerialWithLabelsOnDemand'
            })
            break;
        case "Stamen":
            tileSource = new ol.source.Stamen({layer: 'terrain'});
            break;
        default:
            tileSource = new ol.source.OSM();
            break;
    }

    // Map creation
    if (!map) {
        map = new ol.Map({
            target: 'map',
            layers: [new ol.layer.Tile({ source: tileSource })],
            view: new ol.View({
                center: ol.proj.fromLonLat([37.41, 8.82]),
                zoom: 4
            })
        });
    }

    // Add the Layer with the GPX Track
    map.addLayer(trackLayer);

    layerSource.once('change', function (e) {
        try {
            if (layerSource.getState() === 'ready') {
                
                // Sets the view
                if (savedView) {
                    map.setView(savedView);
                    savedView = null;
                }
                else
                    // Zooms in on the track
                    map.getView().fit(layerSource.getExtent(), { padding: [50, 50, 50, 50] });

                // Departure node
                layerSource.getFeatureById(1)?.setStyle(styleDeparture);

                // Looking for arrival node id
                let arrivalId = layerSource.getFeatures().length;
                while (!layerSource.getFeatureById(arrivalId) && arrivalId > 1) arrivalId--;
                if (arrivalId > 1) layerSource.getFeatureById(arrivalId).setStyle(styleArrival);
            }
        } finally {
            statusMessage.textContent = "";
        }
    });
}