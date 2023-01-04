import * as RNLocalize from 'react-native-localize'
import i18n from 'i18n-js'
import { memoize } from 'lodash'
import { I18nManager } from 'react-native'
import { store } from '@/redux'
import moment from 'moment'

// import 'moment/locale/en' en is default, so can't be imported
import 'moment/locale/de'
import 'moment/locale/nl'
import 'moment/locale/fr'
import 'moment/locale/ru'
import 'moment/locale/it'
import 'moment/locale/pl'
import 'moment/locale/sl'
import 'moment/locale/hr'

import { getAllCountries } from 'react-native-country-picker-modal'

const translationGetters = {
    de: () => require('@/assets/translations/de.json'),
    en: () => require('@/assets/translations/en.json'),
    nl: () => require('@/assets/translations/nl.json'),
    fr: () => require('@/assets/translations/fr.json'),
    ru: () => require('@/assets/translations/ru.json'),
    it: () => require('@/assets/translations/it.json'),
    pl: () => require('@/assets/translations/pl.json'),
    sl: () => require('@/assets/translations/sl.json'),
    hr: () => require('@/assets/translations/hr.json'),
}

export const translate = memoize(
    (key, config) => i18n.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key)
)

export const getLocale = () => i18n.locale
export const getLocale3 = (language = null) => ({
    de: 'deu',
    en: 'eng',
    nl: 'nld',
    fr: 'fra',
    ru: 'rus',
    it: 'ita',
    pl: 'pol',
    sl: 'slv',
    hr: 'hrv',
}[language || i18n.locale])

const translateCountries = (language) => {
    let locale3 = getLocale3(language)

    let countries = getAllCountries().reduce((list, country) => {
        let name = country.name[locale3 == 'eng' ? 'common' : locale3]
        if (!name) name = country.name.common
        list[country.cca2] = name
        
        return list
    }, {})
    
    return { country: countries }
}

export const setI18nConfig = () => {
    const fallback = { languageTag: 'en' }
    let { languageTag } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback
    
    let user = store.getState().auth.user
    let defaultLanguage = user ? user.default_language : null
    if (defaultLanguage && Object.keys(translationGetters).includes(defaultLanguage)) {
        languageTag = defaultLanguage
    }

    translate.cache.clear()
    I18nManager.forceRTL(false) // We don't support RTL languages currently

    i18n.translations = { [languageTag]: { ...translateCountries(languageTag), ...translationGetters[languageTag]() } }
    i18n.locale = languageTag
    moment.locale(languageTag)
}
