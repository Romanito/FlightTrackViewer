var pageTitle = "Flight Logs"
var map = null;
var traceLayer = null;
var statusMessage = document.getElementById("statusMessage");

// traceFiles selection box
var traceFiles = document.getElementById("traceFiles");
traceFiles.addEventListener("change", e => {
    history.pushState(null, null, "?trace=" + traceFiles.value);
    loadSelectedTrace();
});

// Enables navigating traces via history
window.addEventListener("popstate", e => {
    setTraceFromQuerystring();
});

setTraceFromQuerystring();

// Reads the query string and sets the traceFiles value
function setTraceFromQuerystring() {
    let traceFile = getQueryStringParams()["trace"];
    traceFiles.value = traceFile || "";
    loadSelectedTrace();
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

// Loads the selected trace to the map
function loadSelectedTrace() {
    
    statusMessage.textContent = "";
    
    // Clears existing layer
    if (traceLayer != null) {
        map.removeLayer(traceLayer);
        traceLayer = null;
    }

    // Selected trace file
    let traceFile = traceFiles.value;
    document.title = traceFile ? pageTitle + " | " + traceFile : pageTitle;
    if (!traceFile)
        return;

    // Trace format depends on file extension
    let traceFormat, formatOptions = { extractStyles: false, showPointNames: false };
    if (traceFile.endsWith(".kml"))
        traceFormat = new ol.format.KML(formatOptions);
    else if (traceFile.endsWith(".kmz"))
        traceFormat = new KMZ(formatOptions);
    else if (traceFile.endsWith(".gpx"))
        traceFormat = new ol.format.GPX(formatOptions);
    else {
        alert("Unsupported file format");
        return;
    }
    
    statusMessage.textContent = "Loading...";

    // Layer source (refers trace file)
    /*let layerSource;
    if (traceFile.endsWith(".kmz")) {
        layerSource = new ol.source.Vector({
            format: traceFormat,
            // KMZ loader
            loader: function(extent, resolution, projection) {
                let onError = function() {
                    layerSource.removeLoadedExtent(extent);
                }
                fetch("traces/" + traceFile)
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
            format: traceFormat,
            url: "traces/" + traceFile
        });
    }*/


    // Layer source (refers trace file)
    let layerSource = new ol.source.Vector({
        url: "traces/" + traceFile,
        format: traceFormat
    });

    // Trace stroke style
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

    // Trace layer
    traceLayer = new ol.layer.Vector({
        source: layerSource,
        style: layerStyle
    });

    // Departure / arrival icons
    let styleDeparture = new ol.style.Style({ text: new ol.style.Text({ text: "🛫", scale: [3, 3] }) });
    let styleArrival = new ol.style.Style({ text: new ol.style.Text({ text: "🛬", scale: [3, 3] }) });

    // Map creation
    if (!map) {
        map = new ol.Map({
            target: 'map',
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                    /*source: new ol.source.BingMaps({
                        key: 'bing maps key',
                        imagerySet: 'AerialWithLabelsOnDemand'
                    })*/
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([37.41, 8.82]),
                zoom: 4
            })
        });
    }

    // Add the Layer with the GPX Track
    map.addLayer(traceLayer);

    layerSource.once('change', function (e) {
        try {
            if (layerSource.getState() === 'ready') {
                // Zooms in on the trace
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