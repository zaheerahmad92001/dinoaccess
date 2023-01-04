/*
 * Die Einstellung für ein Register hat immer den selben Aufbau wie beim CF100 ("registers.json"):
 * { "label": "name", "register": 150, "unit": "mg/l", "range": [0, 10], "comma": 2 }
 * 
 * Da die Register nicht in einer separaten Datei definiert werden, gibt es noch ein paar zusätzliche Felder:
 * 
 * - "type": "slider" / "list" / "timeInterval"
 * -> Im Fall "list" gibt es das zusätzliche Feld "options": { 0: "Aus", 1: "Ein" }
 * -> Im Fall "timeIntervall" siehe die "setpoints.js" des CF100
 * 
 * - "visible": (registers) => { return registers[90] == 1 && registers[91] == 0 }
 * -> Diese Funktion wird evaluiert um zu prüfen, ob das Register angezeigt werden soll.
 * -> In "registers" stehen die Werte aller Register der entsprechenden Anlage
 */

export default {

    "pcd.setpoints.titles.freechlorine": {
        "visible": (registers) => registers[1] == 221,
        "pages": require('./desinfection/freechlorine').default
    },
    "pcd.setpoints.titles.organicchlorine": {
        "visible": (registers) => registers[1] == 222,
        "pages": require('./desinfection/organicchlorine').default
    },
    "pcd.setpoints.titles.brom": {
        "visible": (registers) => registers[1] == 223, 
        "pages": require('./desinfection/brom').default
    },
    "pcd.setpoints.titles.chlordioxid": {
        "visible": (registers) => registers[1] == 224, 
        "pages": require('./desinfection/chlordioxid').default
    },
    "pcd.setpoints.titles.ozon": {
        "visible": (registers) => registers[1] == 225,
        "pages": require('./desinfection/ozon').default
    },
    "pcd.setpoints.titles.poolcare": {
        "visible": (registers) => registers[1] == 226,
        "pages": require('./desinfection/poolcare').default
    },
    "pcd.setpoints.titles.poolcareTime": {
        "visible": (registers) => registers[1] == 227,
        "registers": [
            {
                "label": "pcd.setpoints.desinfection.poolsize",
                "register": 49,
                "unit": "m³",
                "range": [1, 150],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.circulationTime",
                "register": 50,
                "unit": "h",
                "range": [0, 24],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.pumppower",
                "register": 51,
                "unit": "l/h",
                "range": [5, 110],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.finedosing",
                "register": 52,
                "unit": "%",
                "range": [-20, 20],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.concentration",
                "register": 53,
                "unit": "%",
                "range": [1, 50],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
        ]
    },
    "pcd.setpoints.titles.redox": {
        "visible": (registers) => registers[1] == 228,
        "pages": require('./desinfection/redox').default
    },
    "pcd.setpoints.titles.ph": {
        "visible": (registers) => registers[3] == 241,
        "pages": require('./ph').default,
    },
    "pcd.setpoints.titles.temperature":{
        "visible": (registers) => registers[5] != 232,
        "registers": [
            {
                "label": "pcd.setpoints.temperature.upperAlarm",
                "register": 82,
                "range": [0, 400],
                "unit": "°C",
                "comma": 1,
            },
            {
                "label": "pcd.setpoints.temperature.upperWarn",
                "register": 83,
                "unit": "°C",
                "range": [0, 400],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.temperature.setpoint",
                "register": 84,
                "unit": "°C",
                "range": [0, 400],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.temperature.lowerWarn",
                "register": 85,
                "unit": "°C",
                "range": [0, 400],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.temperature.lowerAlarm",
                "register": 86,
                "unit": "°C",
                "range": [0, 400],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.temperature.correction",
                "register": 87,
                "unit": "°C",
                "range": [-50, 50],
                "comma": 1,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.temperature.alarmdelay",
                "register": 89,
                "range": [0, 15],
                "comma": 0,
                "unit": "Min",
                "type": "slider",
            },
        ],
    },
    "pcd.setpoints.titles.solar":{
        "visible": (registers) => registers[5] == 233,
        "registers": [
            {
                "label": "pcd.setpoints.solar.diff",
                "register": 89,
                "range": [0, 25],
                "unit": "°C",
                "comma": 0,
            },
        ],
    },
    "pcd.setpoints.titles.samplewater": {
        "visible": (registers) => registers[16] == 248,
        "registers": [
            {
                "label": "pcd.setpoints.samplewater.flow",
                "register": 135,
                "unit": "l/h",
                "comma": 0,
                "readonly": true,
            },
            {
                "label": "pcd.setpoints.samplewater.flowrate",
                "register": 67,
                "unit": "P/l",
                "range": [10, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('C'),
            },
            {
                "label": "pcd.setpoints.samplewater.maxflow",
                "register": 68,
                "unit": "l/h",
                "range": [10, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('C'),
            },
            {
                "label": "pcd.setpoints.samplewater.minflow",
                "register": 69,
                "unit": "l/h",
                "range": [50, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('C'),
            },
            {
                "label": "pcd.setpoints.samplewater.compensation",
                "register": 70,
                "range": [50, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('C'),
            },
        ],
    },
    "pcd.setpoints.titles.aer": {
        "visible": (registers) => registers[1] != 227 & registers[1] != 228,
        "registers": [
            {
                "label": "pcd.setpoints.aer.timeperday",
                "register": 76,
                "unit": "times",
                "range": [0, 2],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.aer.hours",
                "register": 77,
                "unit": "h",
                "range": [0, 24],
                "comma": 0,
                "type": "slider",
                "visible": (registers) => registers[76] > 0,
            },
            {
                "label": "pcd.setpoints.aer.minutes",
                "register": 78,
                "unit": "min",
                "range": [0, 59],
                "comma": 0,
                "type": "slider",
                "visible": (registers) => registers[76] > 0,
            },
            {
                "label": "pcd.setpoints.aer.hours",
                "register": 79,
                "unit": "h",
                "range": [0, 24],
                "comma": 0,
                "type": "slider",
                "visible": (registers) => registers[76] == 2,
            },
            {
                "label": "pcd.setpoints.aer.minutes",
                "register": 80,
                "unit": "min",
                "range": [0, 59],
                "comma": 0,
                "type": "slider",
                "visible": (registers) => registers[76] == 2,
            }
        ]
    },
    "pcd.setpoints.titles.filter": {
        "visible": (registers) => registers[0] == 303 & registers[4] == 241,
        "pages": require('./filter').default
    },
    "pcd.setpoints.titles.datetime": {
        "registers": [
            {
                "label": "pcd.setpoints.time.hours",
                "register": 71,
                "range": [0, 23],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.time.minutes",
                "register": 72,
                "range": [0, 59],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.time.day",
                "register": 73,
                "range": [1, 31],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.time.month",
                "register": 74,
                "range": [1, 12],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.time.year",
                "register": 75,
                "range": [2016, 2099],
                "comma": 0,
                "type": "slider",
            },
        ],
    },
}
