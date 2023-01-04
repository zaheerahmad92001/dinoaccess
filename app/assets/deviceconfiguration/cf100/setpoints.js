export default {
    "ph": [
        {
            "register": "sollPH",
            "label": "cf100.setpoints.ph.sollPH",
            "type": "slider"
        },
        {
            "register": "pBerPH",
            "label": "cf100.setpoints.ph.pBerPH",
            "type": "slider",
            "readonly": true
        },
        {
            "register": "hystPH",
            "label": "cf100.setpoints.ph.hystPH",
            "type": "slider",
            "readonly": true
        }
    ],
    "redox": {
        "visible": (registers) => {
            return registers['91'] != 1 && registers['45'] != 994
        },
        "list": [
            {
                "register": "sollRx",
                "label": "cf100.setpoints.redox.sollRx"
            },
            {
                "register": "pBerRx",
                "label": "cf100.setpoints.redox.pBerRx",
                "readonly": true
            },
            {
                "register": "hystereseRedox",
                "label": "cf100.setpoints.redox.hystereseRedox",
                "readonly": true
            }
        ]
    },
    "poolcare": {
        "visible": (registers) => {
            return registers['91'] != 0 && registers['45'] != 994
        },
        "list": [
            {
                "register": "tDosZeit",
                "label": "cf100.setpoints.poolcare.tDosZeit"
            },
            {
                "register": "taglPumpLz",
                "label": "cf100.setpoints.poolcare.taglPumpLz"
            }
        ]
    },
    "temperature": {
        "visible": (registers) => {
            return registers['90'] != 0
        },
        "list": [
            {
                "register": "sollTemp",
                "label": "cf100.setpoints.temperature.sollTemp"
            },
            {
                "register": "tempKorrektur0",
                "label": "cf100.setpoints.temperature.tempKorrektur0"
            },
            {
                "register": "tempKorrektur1",
                "label": "cf100.setpoints.temperature.tempKorrektur1",
                "visible": (registers) => {
                    return registers['94'] != 0
                }
            },
            {
                "register": "solarTempDiff",
                "label": "cf100.setpoints.temperature.solarTempDiff",
                "visible": (registers) => {
                    return registers['94'] != 0
                }
            }
        ]
    },
    "timer": {
        "visible": (registers) => {
            return registers['90'] != 0 && registers['45'] != 994
        },
        "list": [
            {
                "register": "schaltFPst0",
                "label": "cf100.setpoints.timer.schaltFPst0",
                "type": "timeInterval",
                "others": [
                    "schaltFPmin0",
                    "schaltFPst1",
                    "schaltFPmin1",
                    "schaltFPwirk0",
                    "schaltFPwirk1"
                ]
            },
            {
                "register": "schaltFPst2",
                "label": "cf100.setpoints.timer.schaltFPst2",
                "type": "timeInterval",
                "others": [
                    "schaltFPmin2",
                    "schaltFPst3",
                    "schaltFPmin3",
                    "schaltFPwirk2",
                    "schaltFPwirk3"
                ]
            }
        ]
    },
    "relais": {
        "visible": (registers) => {
            return false
        },
        "list": [
            {
                "section": "Relais 0",
                "registers": [
                    {
                        "register": "modR0",
                        "label": "Modus",
                        "type": "list",
                        "options": {
                            "0": "Ein / Aus",
                            "1": "Pulsfrequenz",
                            "2": "Puls / Pause"
                        }
                    },
                    {
                        "register": "maxPulseR0",
                        "label": "Max. Pulsfrequenz"
                    },
                    {
                        "register": "perDauerR0",
                        "label": "Periodendauer"
                    },
                    {
                        "register": "minImpulsDauerR0",
                        "label": "Mindestimpulsdauer"
                    }
                ]
            },
            {
                "section": "Relais 1",
                "registers": [
                    {
                        "register": "modR1",
                        "label": "Modus",
                        "type": "list",
                        "options": {
                            "0": "Ein / Aus",
                            "1": "Pulsfrequenz",
                            "2": "Puls / Pause"
                        }
                    },
                    {
                        "register": "maxPulseR1",
                        "label": "Max. Pulsfrequenz"
                    },
                    {
                        "register": "perDauerR1",
                        "label": "Periodendauer"
                    },
                    {
                        "register": "minImpulsDauerR1",
                        "label": "Mindestimpulsdauer"
                    }
                ]
            },
            {
                "section": "Relais 2",
                "registers": [
                    {
                        "register": "modR2",
                        "label": "Modus",
                        "type": "list",
                        "options": {
                            "0": "Ein / Aus",
                            "1": "Pulsfrequenz",
                            "2": "Puls / Pause"
                        }
                    },
                    {
                        "register": "maxPulseR2",
                        "label": "Max. Pulsfrequenz"
                    },
                    {
                        "register": "perDauerR2",
                        "label": "Periodendauer"
                    },
                    {
                        "register": "minImpulsDauerR2",
                        "label": "Mindestimpulsdauer"
                    }
                ]
            }
        ]
    }
}
