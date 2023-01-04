// Diese Datei definiert die Unterseiten von "redox"

export default {
    "pcd.setpoints.desinfection.titles.title1": {
        "registers": [
            {
                "label": "pcd.setpoints.desinfection.upperWarn",
                "register": 114,
                "unit": "mV",
                "range": [350, 950],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.setpoint",
                "register": 115,
                "unit": "mV",
                "range": [350, 950],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.lowerWarn",
                "register": 116,
                "unit": "mV",
                "range": [350, 950],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.lowerAlarm",
                "register": 117,
                "unit": "mV",
                "range": [350, 950],
                "comma": 0,
                "type": "slider",
            },
            {
                "label": "pcd.setpoints.desinfection.alarmDelay",
                "register": 118,
                "unit": "Min",
                "range": [0, 15],
                "comma": 0,
                "type": "slider",
            },
        ],
    },
    "pcd.setpoints.desinfection.titles.title2": {
        "registers": [
            {
                "label": "pcd.setpoints.desinfection.pRange",
                "register": 119,
                "unit": "mV",
                "range": [5, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
            {
                "label": "pcd.setpoints.desinfection.hysterese",
                "register": 121,
                "unit": "mV",
                "range": [0, 100],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
        ],
    },
    "pcd.setpoints.desinfection.titles.title3": {
        "registers": [
            {
                "label": "pcd.setpoints.desinfection.manDosing",
                "register": 46,
                "unit": "Min",
                "range": [0, 500],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
            {
                "label": "pcd.setpoints.desinfection.dosingTime",
                "register": 47,
                "unit": "Min",
                "range": [0, 180],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
        ],
    },
    "pcd.setpoints.desinfection.titles.title4": {
        "registers": [
            {
                "label": "pcd.setpoints.desinfection.compensation",
                "register": 14,
                "type": "list",
                "options": { 250: "pcd.setpoints.desinfection.options.auto", 249: "pcd.setpoints.desinfection.options.manual" },
                "enabled": (registers, code) => code('B'),
            },
            {
                "label": "pcd.setpoints.desinfection.manCompensation",
                "visible": (registers) => registers[14] == 249,
                "register": 48,
                "unit": "°C",
                "range": [0, 50],
                "comma": 0,
                "type": "slider",
                "enabled": (registers, code) => code('B'),
            },
        ],
    },
}
