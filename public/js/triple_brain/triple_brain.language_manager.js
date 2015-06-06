/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.user_service",
    "triple_brain.event_bus",
    "jquery.i18next"
], function ($, UserService, EventBus) {
    "use strict";
    var api = {},
        possibleLanguages;
    api.getBrowserLocale = function () {
        return $.i18n.detectLanguage();
    };
    api.getPossibleLanguages = function () {
        if (possibleLanguages === undefined) {
            possibleLanguages = makeLanguages([
                ["Albanian (Albania)", "sq_AL"],
                ["Albanian", "sq"],
                ["Arabic (Algeria)", "ar_DZ"],
                ["Arabic (Bahrain)", "ar_BH"],
                ["Arabic (Egypt)", "ar_EG"],
                ["Arabic (Iraq)", "ar_IQ"],
                ["Arabic (Jordan)", "ar_JO"],
                ["Arabic (Kuwait)", "ar_KW"],
                ["Arabic (Lebanon)", "ar_LB"],
                ["Arabic (Libya)", "ar_LY"],
                ["Arabic (Morocco)", "ar_MA"],
                ["Arabic (Oman)", "ar_OM"],
                ["Arabic (Qatar)", "ar_QA"],
                ["Arabic (Saudi Arabia)", "ar_SA"],
                ["Arabic (Sudan)", "ar_SD"],
                ["Arabic (Syria)", "ar_SY"],
                ["Arabic (Tunisia)", "ar_TN"],
                ["Arabic (United Arab Emirates)", "ar_AE"],
                ["Arabic (Yemen)", "ar_YE"],
                ["Arabic", "ar"],
                ["Belarusian (Belarus)", "be_BY"],
                ["Belarusian", "be"],
                ["Bulgarian (Bulgaria)", "bg_BG"],
                ["Bulgarian", "bg"],
                ["Catalan (Spain)", "ca_ES"],
                ["Catalan", "ca"],
                ["Chinese (China)", "zh_CN"],
                ["Chinese (Hong Kong)", "zh_HK"],
                ["Chinese (Singapore)", "zh_SG"],
                ["Chinese (Taiwan)", "zh_TW"],
                ["Chinese", "zh"],
                ["Croatian (Croatia)", "hr_HR"],
                ["Croatian", "hr"],
                ["Czech (Czech Republic)", "cs_CZ"],
                ["Czech", "cs"],
                ["Danish (Denmark)", "da_DK"],
                ["Danish", "da"],
                ["Dutch (Belgium)", "nl_BE"],
                ["Dutch (Netherlands)", "nl_NL"],
                ["Dutch", "nl"],
                ["English (Australia)", "en_AU"],
                ["English (Canada)", "en_CA"],
                ["English (India)", "en_IN"],
                ["English (Ireland)", "en_IE"],
                ["English (Malta)", "en_MT"],
                ["English (New Zealand)", "en_NZ"],
                ["English (Philippines)", "en_PH"],
                ["English (Singapore)", "en_SG"],
                ["English (South Africa)", "en_ZA"],
                ["English (United Kingdom)", "en_GB"],
                ["English (United States)", "en_US"],
                ["English", "en"],
                ["Estonian (Estonia)", "et_EE"],
                ["Estonian", "et"],
                ["Finnish (Finland)", "fi_FI"],
                ["Finnish", "fi"],
                ["Français (Belgium)", "fr_BE"],
                ["Français (Canada)", "fr_CA"],
                ["Français (France)", "fr_FR"],
                ["Français (Luxembourg)", "fr_LU"],
                ["Français (Switzerland)", "fr_CH"],
                ["Français", "fr"],
                ["German (Austria)", "de_AT"],
                ["German (Germany)", "de_DE"],
                ["German (Luxembourg)", "de_LU"],
                ["German (Switzerland)", "de_CH"],
                ["German", "de"],
                ["Greek (Cyprus)", "el_CY"],
                ["Greek (Greece)", "el_GR"],
                ["Greek", "el"],
                ["Hebrew (Israel)", "iw_IL"],
                ["Hebrew", "iw"],
                ["Hindi (India)", "hi_IN"],
                ["Hungarian (Hungary)", "hu_HU"],
                ["Hungarian", "hu"],
                ["Icelandic (Iceland)", "is_IS"],
                ["Icelandic", "is"],
                ["Indonesian (Indonesia)", "in_ID"],
                ["Indonesian", "in"],
                ["Irish (Ireland)", "ga_IE"],
                ["Irish", "ga"],
                ["Italian (Italy)", "it_IT"],
                ["Italian (Switzerland)", "it_CH"],
                ["Italian", "it"],
                ["Japanese (Japan)", "ja_JP"],
                ["Japanese (Japan,JP)", "ja_JP_JP"],
                ["Japanese", "ja"],
                ["Korean (South Korea)", "ko_KR"],
                ["Korean", "ko"],
                ["Latvian (Latvia)", "lv_LV"],
                ["Latvian", "lv"],
                ["Lithuanian (Lithuania)", "lt_LT"],
                ["Lithuanian", "lt"],
                ["Macedonian (Macedonia)", "mk_MK"],
                ["Macedonian", "mk"],
                ["Malay (Malaysia)", "ms_MY"],
                ["Malay", "ms"],
                ["Maltese (Malta)", "mt_MT"],
                ["Maltese", "mt"],
                ["Norwegian (Norway)", "no_NO"],
                ["Norwegian (Norway,Nynorsk)", "no_NO_NY"],
                ["Norwegian", "no"],
                ["Polish (Poland)", "pl_PL"],
                ["Polish", "pl"],
                ["Portuguese (Brazil)", "pt_BR"],
                ["Portuguese (Portugal)", "pt_PT"],
                ["Portuguese", "pt"],
                ["Romanian (Romania)", "ro_RO"],
                ["Romanian", "ro"],
                ["Russian (Russia)", "ru_RU"],
                ["Russian", "ru"],
                ["Serbian (Bosnia and Herzegovina)", "sr_BA"],
                ["Serbian (Montenegro)", "sr_ME"],
                ["Serbian (Serbia and Montenegro)", "sr_CS"],
                ["Serbian (Serbia)", "sr_RS"],
                ["Serbian", "sr"],
                ["Slovak (Slovakia)", "sk_SK"],
                ["Slovak", "sk"],
                ["Slovenian (Slovenia)", "sl_SI"],
                ["Slovenian", "sl"],
                ["Spanish (Argentina)", "es_AR"],
                ["Spanish (Bolivia)", "es_BO"],
                ["Spanish (Chile)", "es_CL"],
                ["Spanish (Colombia)", "es_CO"],
                ["Spanish (Costa Rica)", "es_CR"],
                ["Spanish (Dominican Republic)", "es_DO"],
                ["Spanish (Ecuador)", "es_EC"],
                ["Spanish (El Salvador)", "es_SV"],
                ["Spanish (Guatemala)", "es_GT"],
                ["Spanish (Honduras)", "es_HN"],
                ["Spanish (Mexico)", "es_MX"],
                ["Spanish (Nicaragua)", "es_NI"],
                ["Spanish (Panama)", "es_PA"],
                ["Spanish (Paraguay)", "es_PY"],
                ["Spanish (Peru)", "es_PE"],
                ["Spanish (Puerto Rico)", "es_PR"],
                ["Spanish (Spain)", "es_ES"],
                ["Spanish (United States)", "es_US"],
                ["Spanish (Uruguay)", "es_UY"],
                ["Spanish (Venezuela)", "es_VE"],
                ["Spanish", "es"],
                ["Swedish (Sweden)", "sv_SE"],
                ["Swedish", "sv"],
                ["Thai (Thailand)", "th_TH"],
                ["Thai (Thailand,TH)", "th_TH_TH"],
                ["Thai", "th"],
                ["Turkish (Turkey)", "tr_TR"],
                ["Turkish", "tr"],
                ["Ukrainian (Ukraine)", "uk_UA"],
                ["Ukrainian", "uk"],
                ["Vietnamese (Vietnam)", "vi_VN"],
                ["Vietnamese", "vi"]
            ]);
        }
        return possibleLanguages;
    };
    api.englishLanguage = function () {
        return makeLanguage(
            "english",
            "en"
        );
    };
    api.frenchLanguage = function () {
        return makeLanguage(
            "français",
            "fr"
        );
    };
    api.loadLocaleContent = function (callback) {
        var locale = getLocaleUsedForSiteTranslation();
        $.i18n.init({
            lng: locale,
            useLocalStorage: false,
            debug: true,
            customLoad: function (lng, ns, options, loadComplete) {
                var basePath = ns === "translation" ?
                    "/locales/" :
                "/js/module/" + ns + "/locales/";
                var url = basePath + lng + "/" + "translation" + ".json";
                $.ajax({
                    url: url,
                    dataType: 'json'
                }).success(function (data) {
                    loadComplete(
                        null,
                        data
                    );
                    EventBus.publish("localized-text-loaded")
                });

            }
        }, callback);
    };
    return api;

    function isLocaleFrench(locale) {
        return locale.indexOf(
                "fr"
            ) >= 0;
    }

    function isLocaleEnglish(locale) {
        return locale.indexOf(
                "en"
            ) >= 0;
    }

    function makeLanguage(fullname, locale) {
        return {
            fullname: fullname,
            locale: locale
        };
    }

    function makeLanguages(languages) {
        var formattedLanguages = [];
        $.each(languages, function () {
            formattedLanguages.push(
                makeLanguage(
                    this[0],
                    this[1]
                )
            );
        });
        return formattedLanguages;
    }

    function getLocaleUsedForSiteTranslation() {
        var currentUser = UserService.authenticatedUserInCache();
        return currentUser === undefined ?
            getFromBrowser() :
            getFromUser();
        function getFromUser() {
            var localeUsedForSiteTranslation = "en";
            $.each(currentUser.preferred_locales, function () {
                var locale = this;
                if (isLocaleEnglish(locale)) {
                    return false;
                }
                if (isLocaleFrench(locale)) {
                    localeUsedForSiteTranslation = "fr";
                    return false;
                }
            });
            return localeUsedForSiteTranslation;
        }

        function getFromBrowser() {
            return isLocaleFrench(api.getBrowserLocale()) ?
                "fr" :
                "en";
        }
    }
});