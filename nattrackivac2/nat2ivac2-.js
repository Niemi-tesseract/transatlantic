var fs = require('fs');
var request = require('request-promise');

var url = 'https://pilotweb.nas.faa.gov/common/nat.html';
var config = require('./config.js');
var tracksE = []
var tracksW = []
var outputW = `var westTracks = [`
var outputE = `var eastTracks = [`
var eastbound;
var westbound;

function search(fix, fixesList) {
    for (var i = 0; i < fixesList.length; i++) {
        if (fixesList[i].name === fix) {
            return fixesList[i].coords;
        }
    }
}

request(url)
    .then((data) => {
        //console.log(data)
        /*if (data.charAt(8) == "C") {
            var westbound = (data.substring(0, data.indexOf("CZQXZQZX"))).split(/\n/);
            var eastbound = (data.substring(data.indexOf("CZQXZQZX"))).split(/\n/);
        } else if (data.charAt(8) == "E") {
            var westbound = (data.substring(0, data.indexOf("EGGXZOZX"))).split(/\n/);
            var eastbound = (data.substring(data.indexOf("EGGXZOZX"))).split(/\n/);
        } else {
            console.log("Shanwick/Gander are broken")
        }*/



        var modulatedData = data.replace(/(\r\n|\n|\r)/gm, "%$");

        var eastboundFull = (modulatedData.match(/CZQXZOZX([\s\S]*?)<\/tr>/g));
        var westboundFull = (modulatedData.match(/EGGXZOZX([\s\S]*?)<\/tr>/g));

        if (eastboundFull != null) {
            eastbound = eastboundFull[0].split(/\%\$/g);


            for (var i = 0; i < eastbound.length; i++) {
                if (eastbound[i].charAt(1) === ' ') {
                    tracksE.push(eastbound[i].split(' '));
                }
            }

            for (var i = 0; i < tracksE.length; i++) {


                outputE = outputE + '\n{' +
                    `"properties": {` + '\n"Track": "' + tracksE[i][0] + '",\n' + `"trackType": "NAT",
`;
                outputE = outputE + '"Waypoints": [';

                for (var j = 1; j < tracksE[i].length; j++) {

                    if (j == ((tracksE[i].length) - 1)) {
                        outputE = outputE + '["' + tracksE[i][j].replace('/', '') + '"]]';
                    } else {
                        outputE = outputE + '["' + tracksE[i][j].replace('/', '') + '"],';
                    }

                    //[-15, 54],
                }

                outputE = outputE + `
},"type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [`
                //loop through all waypoints
                for (var j = 1; j < tracksE[i].length; j++) {
                    //check if coordinate or waypoint
                    if (isNaN(parseInt(tracksE[i][j]))) {
                        var resultObject = search(tracksE[i][j], config.fixes);
                        //check if last in track
                        if (j == ((tracksE[i].length) - 1)) {
                            //check if in database
                            if (resultObject !== undefined) {
                                outputE = outputE + "[" + resultObject + "]]";
                                console.log(tracksE[i][j]);
                            } else {
                                outputE = outputE.substring(0, (outputE.length - 1)) + "]";
                            }
                        } else {
                            if (resultObject !== undefined) {
                                outputE = outputE + "[" + resultObject + "],";
                                console.log(tracksE[i][j]);
                            }
                        }
                        /*
                        // used to show if waypoint is included in dataset
                        // needed due GEOJSON format strictness
                        if (resultObject  !== undefined) {
                        outputE = outputE + " ["+ resultObject+"], ";
                        console.log(tracksE[i][j]);
                        }
                        */

                    } else {

                        var coordinate11 = tracksE[i][j].replace('/', '')
                        //console.log(coordinate11.length)
                        if (tracksE[i][j].replace('/', '').length > 4 && tracksE[i][j].replace('/', '').substring(2, 4) == "30") {
                            var resultObjectNorthing = parseInt(coordinate11.substring(0, 2)) + 0.5;
                            var resultObjectWesting = coordinate11.substring(4, 6)
                        } else {
                            var resultObjectNorthing = coordinate11.substring(0, 2)
                            var resultObjectWesting = coordinate11.substring(2, 4)
                        }
                        outputE = outputE + "[-" + resultObjectWesting + "," + resultObjectNorthing + "],"
                        //console.log(" [" + resultObjectWesting + "," + resultObjectNorthing + "],");
                    }

                }
                outputE = outputE + `}},`

            }
            outputE = outputE.substring(0, (outputE.length - 1)) + "]";

            fs.writeFile('tracksE.map', outputE, function (err) {
                if (err) {
                    return console.error(err);
                }
            });
        } else {
            eastbound = 0
        }


        // remember to change to westbound after testing

        if (westboundFull != null) {
            westbound = westboundFull[0].split(/\%\$/g);
            for (var i = 0; i < westbound.length; i++) {
                if (westbound[i].charAt(1) === ' ') {
                    tracksW.push(westbound[i].split(' '));
                }
            }

            for (var i = 0; i < tracksW.length; i++) {


                outputW = outputW + '\n{' +
                    `"properties": {` + '\n"Track": "' + tracksW[i][0] + '",\n' + `"trackType": "NAT",
`;
                outputW = outputW + '"Waypoints": [';

                for (var j = 1; j < tracksW[i].length; j++) {

                    if (j == ((tracksW[i].length) - 1)) {
                        outputW = outputW + '["' + tracksW[i][j].replace('/', '') + '"]]';
                    } else {
                        outputW = outputW + '["' + tracksW[i][j].replace('/', '') + '"],';
                    }

                }

                outputW = outputW + `
},"type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [`
                //loop through all waypoints
                for (var j = 1; j < tracksW[i].length; j++) {
                    //check if coordinate or waypoint
                    if (isNaN(parseInt(tracksW[i][j]))) {
                        var resultObject = search(tracksW[i][j], config.fixes);
                        //check if last in track
                        if (j == ((tracksW[i].length) - 1)) {
                            //check if in database
                            if (resultObject !== undefined) {
                                outputW = outputW + "[" + resultObject + "]]";
                                console.log(tracksW[i][j]);
                            } else {
                                outputW = outputW.substring(0, (outputW.length - 1)) + "]";
                            }
                        } else {
                            if (resultObject !== undefined) {
                                outputW = outputW + "[" + resultObject + "],";
                                console.log(tracksW[i][j]);
                            }
                        }
                        /*
                        // used to show if waypoint is included in dataset
                        // needed due GEOJSON format strictness
                        if (resultObject  !== undefined) {
                        outputW = outputW + " ["+ resultObject+"], ";
                        console.log(tracksW[i][j]);
                        }
                        */

                    } else {

                        var coordinate1 = tracksW[i][j].replace('/', '')
                        //console.log(coordinate11.length)
                        if (tracksW[i][j].replace('/', '').length > 4 && tracksW[i][j].replace('/', '').substring(2, 4) == "30") {
                            var resultObjectNorthing = parseInt(coordinate1.substring(0, 2)) + 0.5;
                            var resultObjectWesting = coordinate1.substring(4, 6)
                        } else {
                            var resultObjectNorthing = coordinate1.substring(0, 2)
                            var resultObjectWesting = coordinate1.substring(2, 4)
                        }
                        outputW = outputW + "[-" + resultObjectWesting + "," + resultObjectNorthing + "],"
                        //console.log(" [" + resultObjectWesting + "," + resultObjectNorthing + "],");
                    }

                }
                outputW = outputW + `}},`

            }
            outputW = outputW.substring(0, (outputW.length - 1)) + "]";

            fs.writeFile('tracksW.map', outputW, function (err) {
                if (err) {
                    return console.error(err);
                }
            });

        } else {
            eastbound = 0
        }
        //var westbound = (data.substring(0, data.indexOf("CZQXZQZX"))).split(/\n/);
        //var eastbound = (data.substring(data.indexOf("CZQXZQZX"))).split(/\n/);





    })
    .catch(function (err) {
        console.log(err);
    });
