/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "jquery",
    "jquery.nano"
],
    function ($) {
        var api = {};
        api.withTemplateGroup = function(templateGroup){
            return new Template(templateGroup);
        }

        function Template(templateGroup){
            this.add = function(name, html){
                templateGroup[name] = {
                    merge:function (obj) {
                        return $($.nano(html, obj || null));
                    }
                }
            }
        }
        return api;
    }
);
