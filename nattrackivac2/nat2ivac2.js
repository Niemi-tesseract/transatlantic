var fs = require('fs');
var request = require('request-promise');

var url = 'https://pilotweb.nas.faa.gov/common/nat.html';

var tracksE = []
var tracksW = []
var outputW = `var westTracks = [`
var outputE = `var eastTracks = [`
var fixes = [
    {
        "name": "RIKAL",
        "coords": [-54.53, 51.8]
    },
    {
        "name": "NETKI",
        "coords": [-14, 55]
    },
    {
        "name": "BEXET",
        "coords": [-14, 54]
    },
    {
        "name": "OLGON",
        "coords": [-14, 53]
    },
    {
        "name": "GISTI",
        "coords": [-14, 52]
    },
    {
        "name": "RILED",
        "coords": [-14, 51]
    },
    {
        "name": "XETBO",
        "coords": [-14, 50]
    },
    {
        "name": "TUDEP",
        "coords": [-53.2, 51.17]
    },
    {
        "name": "RATSU",
        "coords": [-10, 61]
    },
    {
        "name": "ATSIX",
        "coords": [-10, 60]
    }, {
        "name": "BALIX",
        "coords": [-10, 59]
    }, {
        "name": "ERAKA",
        "coords": [-10, 58]
    }, {
        "name": "GOMUP",
        "coords": [-10, 57]
    }, {
        "name": "SUNOT",
        "coords": [-15, 57]
    }, {
        "name": "BILTO",
        "coords": [-15, 56.5]
    }, {
        "name": "PIKIL",
        "coords": [-15, 56]
    }, {
        "name": "ETARI",
        "coords": [-14, 55.5]
    }, {
        "name": "RESNO",
        "coords": [-13, 55]
    }, {
        "name": "VENER",
        "coords": [-12, 54.5]
    }, {
        "name": "DOGAL",
        "coords": [-11, 54]
    }, {
        "name": "NEBIN",
        "coords": [-10, 53.5]
    }, {
        "name": "MALOT",
        "coords": [-9, 53]
    }, {
        "name": "TOBOR",
        "coords": [-8, 52.5]
    }, {
        "name": "LIMRI",
        "coords": [-7, 52]
    }, {
        "name": "ADARA",
        "coords": [-6, 51.5]
    }, {
        "name": "DINIM",
        "coords": [-5, 51]
    }, {
        "name": "RODEL",
        "coords": [-4, 50.5]
    }, {
        "name": "SOMAX",
        "coords": [-3, 50]
    }, {
        "name": "KOGAR",
        "coords": [-2, 49.5]
    }, {
        "name": "BEDRA",
        "coords": [-15, 49]
    }, {
        "name": "NERTU",
        "coords": [-14, 49]
    }, {
        "name": "NERTU",
        "coords": [-14, 49]
    }, {
        "name": "TAMEL",
        "coords": [-3, 51.35]
    }, {
        "name": "LASNO",
        "coords": [-9, 48.60]
    }, {
        "name": "TULTA",
        "coords": [-8, 48.58]
    }, {
        "name": "ETIKI",
        "coords": [-8.75, 48]
    }, {
        "name": "REGHI",
        "coords": [-8, 48]
    }, {
        "name": "SEPAL",
        "coords": [-8.75, 47]
    }, {
        "name": "LAPEX",
        "coords": [-8, 47]
    }, {
        "name": "SIVIR",
        "coords": [-8.75, 46]
    }, {
        "name": "RIVAK",
        "coords": [-8, 46]
    }
]

function search(fix, fixesList) {
    for (var i = 0; i < fixesList.length; i++) {
        if (fixesList[i].name === fix) {
            return fixesList[i].coords;
        }
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

    for (var j = 1; j < tracksE[i].length; j++) {
        //check if coordinate or waypoint
        if (isNaN(parseInt(tracksE[i][j]))) {
            var resultObject = search(tracksE[i][j], fixes);
            //check if last in track
            if (j == ((tracksE[i].length) - 1)) {
                //check if in database
                if (resultObject !== undefined) {
                    outputE = outputE + "[" + resultObject + "]]";
                    console.log(tracksE[i][j]);
                } else {
                    outputE = outputE.substring(0, (outputE.length - 2)) +
                        "]"
                }
            } else {
                if (resultObject !== undefined) {
                    outputE = outputE + " [" + resultObject + "], ";
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
            outputE = outputE + " [-" + resultObjectWesting + "," + resultObjectNorthing + "],"
            //console.log(" [" + resultObjectWesting + "," + resultObjectNorthing + "],");
        }

    }
    outputE = outputE + `}},`

}
outputE = outputE + `]`

fs.writeFile('tracksE.map', outputE, function (err) {
if (err) {
    return console.error(err);
}
});
})
.catch(function (err) {
    console.log(err);
});





/*
    "type": "Feature",
    "properties": {
        "TMI": 288,
        "Track": "A",
        "Type": "NAT",
        "Waypoints": [
                        ["RATSU"],
                        ["6320N"],
                        ["6430N"],
                        ["6540N"],
                        ["6550N"],
                        ["EMBOK"]
                    ]
    },
    "geometry": {
        "type": "LineString",
        "coordinates": [
                        [-20, 63],
                        [-30, 64],
                        [-40, 65],
                        [-50, 65]
                    ]
    }
}
*/
