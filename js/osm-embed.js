var map = new ol.Map({
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

var traceLayer = null;

var traceFiles = document.getElementById("traceFiles");
traceFiles.addEventListener("change", e => {

    // Clears existing layer
    if (traceLayer != null)
        map.removeLayer(traceLayer);

    let traceFile = traceFiles.value;
    if (traceFile == "0")
        return;

    // Trace format depends on file extension
    let traceFormat;
    if (traceFile.endsWith(".kml"))
        traceFormat = new ol.format.KML({ extractStyles: false, showPointNames: false });
    else if (traceFile.endsWith(".gpx"))
        traceFormat = new ol.format.GPX({ extractStyles: false, showPointNames: false });
    else {
        alert("Unsupported file format");
        return;
    }

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

    // Add the Layer with the GPX Track
    map.addLayer(traceLayer);

    layerSource.once('change', function (e) {
        if (layerSource.getState() === 'ready') {
            // Departure node
            layerSource.getFeatureById(1)?.setStyle(styleDeparture);

            // Looking for arrival node id
            let arrivalId = layerSource.getFeatures().length;
            while (!layerSource.getFeatureById(arrivalId) && arrivalId > 1) arrivalId--;
            if (arrivalId > 1) layerSource.getFeatureById(arrivalId).setStyle(styleArrival);

            // Zooms in on the trace
            map.getView().fit(layerSource.getExtent(), { padding: [50, 50, 50, 50] });
        }
    });

});