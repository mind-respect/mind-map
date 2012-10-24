/*
 * Copyright Mozilla Public License 1.1
 */

define(
    [
        "jQuery",
        "triple_brain.mind-map_template",
        "triple_brain.ui.utils"
    ],
    function($, MindMapTemplate, UiUtils){
        var api = {}
        api.ofVertex = function (vertex) {
            return new ImageMenu(vertex);
        }
        return api;

        function ImageMenu(vertex){
            var imageMenu = this;
            var html;
            this.create = function(){
                html = MindMapTemplate['images_menu'].merge();
                addContainer();
                addMenu();
                UiUtils.positionLeft(html, vertex.html());
            }
            function addContainer(){
                html.append(
                    MindMapTemplate['images_container'].merge()
                )
            }
            function addMenu(){
                html.append(
                    MindMapTemplate['images_menu'].merge()
                )
            }
        }

    }
);