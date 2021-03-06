var normalize = require('@mapbox/geojson-normalize');
var geojsonStream = require('geojson-stream');
var fs = require('fs');
var StreamConcat = require('stream-concat');

/**
 * Merge a series of GeoJSON objects into one FeatureCollection containing all
 * features in all files.  The objects can be any valid GeoJSON root object,
 * including FeatureCollection, Feature, and Geometry types.
 *
 * @param {Array<Object>} inputs a list of GeoJSON objects of any type
 * @return {Object} a geojson FeatureCollection.
 * @example
 * var geojsonMerge = require('@mapbox/geojson-merge');
 *
 * var mergedGeoJSON = geojsonMerge.merge([
 *   { type: 'Point', coordinates: [0, 1] },
 *   { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 1] }, properties: {} }
 * ]);
 *
 * console.log(JSON.stringify(mergedGeoJSON));
 */
function merge (inputs) {
    var output = {
        type: 'FeatureCollection',
        features: []
    };
    for (var i = 0; i < inputs.length; i++) {
        var normalized = normalize(inputs[i]);
        for (var j = 0; j < normalized.features.length; j++) {
            output.features.push(normalized.features[j]);
        }
    }
    return output;
}

/**
 * Merge GeoJSON files containing GeoJSON FeatureCollections
 * into a single stream of a FeatureCollection as a JSON string.
 *
 * This is more limited than merge - it only supports FeatureCollections
 * as input - but more performant, since it can operate on GeoJSON files
 * larger than what you can keep in memory at one time.
 * @param {Array<string>} inputs a list of filenames of GeoJSON files
 * @returns {Stream} output: a stringified JSON of a FeatureCollection.
 * @example
 * var geojsonMerge = require('@mapbox/geojson-merge');
 *
 * var mergedStream = geojsonMerge.mergeFeatureCollectionStream([
 *   'features.geojson',
 *   'otherFeatures.geojson'])
 *
 * mergedStream.pipe(process.stdout);
 */
function mergeFeatureCollectionStream (inputs) {
    const out = geojsonStream.stringify();
    const streams = inputs.map(file => fs.createReadStream(file));
    new StreamConcat(streams)
        .pipe(geojsonStream.parse())
        .pipe(out);
    return out;
}

module.exports.merge = merge;
module.exports.mergeFeatureCollectionStream = mergeFeatureCollectionStream;
