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
    "kmze.setpoints.titles.soledosierung": {
        "registers": [
            {
                "register": 6,
                "label": "kmze.setpoints.sole.anpassSole",
                "unit": "%",
                "default": 0,
                "range": [
                  -50,
                  50
                ],
                "comma": 0,
                "type": "slider",
                "readonly": false
            }
        ],
    },
    "kmze.setpoints.titles.produkttank": {
        "visible": (registers) => {
            return registers['0'] == 2 || registers['0'] == 3 || registers['0'] == 6 || registers['0'] == 7 //is NaOCl
        },
        "registers": [
            {
                "label": "kmze.setpoints.produkttank.istProdukttank",
                "register": 13,
                "unit": "cm",
                "default": 10,
                "range": [
                  0,
                  200
                ],
                "comma": 0,
                "readonly": true
            },
            {
                "register": 12,
                "label": "kmze.setpoints.produkttank.fuellProdukt",
                "unit": "cm",
                "default": 10,
                "range": [
                  0,
                  200
                ],
                "comma": 0,
                "readonly": false
            },
            {
                "register": 14,
                "label": "kmze.setpoints.produkttank.levelEin",
                "unit": "cm",
                "default": 20,
                "range": [
                  0,
                  200
                ],
                "comma": 0,
                "readonly": false
            },
            {
                "register": 15,
                "label": "kmze.setpoints.produkttank.levelAus",
                "unit": "cm",
                "default": 80,
                "range": [
                  0,
                  200
                ],
                "comma": 0,
                "readonly": false
            }
        ]
    }
}
