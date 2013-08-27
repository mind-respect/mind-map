/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_element_menu",
    "triple_brain.ui.graph"
],
    function ($, GraphElementMenu, GraphUi) {
        var api = {};
        api.ofVertex = function(vertex){
            return new ImageMenu(
                vertex
            );
        };
        return api;
        function ImageMenu(vertex){
            var self = this;
            var html = $("<div>");
            this.build = function(){
                GraphUi.addHtml(html);
                html.append(form());
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    vertex
                );
                return self;
            };

            function form(){
                html.data(
                    "vertex",
                    vertex
                );
                var form = $(
                    "<form>"
                ).append(
                    uploadLabel()
                );

                function uploadLabel(){
                    return $(
                        "<label data-i18n=''>"
                    );
                }
            }
        }
    }
);