// KMZ format support for OpenLayers

function getKMLData(buffer) {
    let zip = new JSZip();
    let kmlData;
    zip.load(buffer);
    let kmlFile = zip.file(/.kml$/i)[0];
    if (kmlFile) {
        kmlData = kmlFile.asText().trim();
    }
    return kmlData;
}

var KMZ = /*@__PURE__*/(function (KML) {
    function KMZ(opt_options) {
      KML.call(this, opt_options || {});
    }
  
    if ( KML ) KMZ.__proto__ = KML;
    KMZ.prototype = Object.create( KML && KML.prototype );
    KMZ.prototype.constructor = KMZ;
  
    KMZ.prototype.getType = function getType () {
      return 'arraybuffer';
    };
  
    KMZ.prototype.readFeature = function readFeature (source, options) {
      return KML.prototype.readFeature.call(this, getKMLData(source), options);
    };
  
    KMZ.prototype.readFeatures = function readFeatures (source, options) {
      return KML.prototype.readFeatures.call(this, getKMLData(source), options);
    };
  
    return KMZ;
  }(ol.format.KML));