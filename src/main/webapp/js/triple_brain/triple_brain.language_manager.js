/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "jquery.i18next"
], function($){
    var api = {};
    api.getLocale = function(){
        return $.i18n.detectLanguage();
    };
    api.getPossibleLanguages = function(){
        return makeLanguages([
            ["en", "english"],
            ["fr", "français"]
        ]);
    };
    api.englishLanguage = function(){
        return makeLanguage(
            "english",
            "en"
        );
    };
    api.frenchLanguage = function(){
        return makeLanguage(
            "français",
            "fr"
        );
    };
    api.isLocaleFrench = function(){
        return api.getLocale().indexOf(
            "fr"
        ) >= 0;
    };
    api.loadLocaleContent = function(callback){
        var locale = api.isLocaleFrench() ?
            "fr" :
            "en";
        $.i18n.init({
            lng : locale,
            useLocalStorage: false,
            debug: true,
            customLoad : function(lng, ns, options, loadComplete){
                var basePath = ns === "translation" ?
                    "locales/" :
                    "module/mind_map/" + ns + "/locales/";
                var url =  basePath + lng + "/" + "translation" + ".json";
                $.ajax({
                    url : url,
                    dataType:'json'
                }).success(function(data){
                        loadComplete(
                            null,
                            data
                        );
                    });

            }
        }, callback);
    };
    return api;
    function makeLanguage(fullname, locale){
        return {
            fullname : fullname,
            locale : locale
        };
    }
    function makeLanguages(languages){
        var formattedLanguages = [];
        $.each(languages, function(){
            formattedLanguages.push(
                makeLanguage(
                    this[1],
                    this[0]
                )
            );
        });
        return formattedLanguages;
    }
});