/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.vertex",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_menu"
], function($, VertexService, GraphDisplayer, GraphElementMenu){
    var api = {};
    api.forSingle = function(){
        var subApi = {};
        subApi.note = function(event, vertex){
            var noteDialog = $(
                "<div>"
            ).attr(
                "title", vertex.text()
            ).append(
                $("<textarea rows='' cols=''>").append(
                    vertex.getNote()
                )
            );
            var buttonsOptions = {};
            buttonsOptions[$.t("vertex.menu.note.update")] = function (event) {
                var dialog = $(this);
                var textContainer = $(event.currentTarget).find(".ui-button-text");
                textContainer.text(
                    $.t("vertex.menu.note.saving") + " ..."
                );
                VertexService.updateNote(
                    vertex,
                    dialog.find("textarea").val(),
                    function (vertex) {
                        if(vertex.hasNote()){
                            vertex.getNoteButtonInBubbleContent().show();
                            vertex.getNoteButtonInMenu().hide();
                        }else{
                            vertex.getNoteButtonInBubbleContent().hide();
                            vertex.getNoteButtonInMenu().show();
                        }

                        $(dialog).dialog("close");
                    }
                );
            };
            var menuExtraOptions = {
                height:350,
                width:500,
                dialogClass:"vertex-note",
                modal:true,
                buttons:buttonsOptions
            };
            GraphElementMenu.makeForMenuContentAndGraphElement(
                noteDialog,
                vertex,
                menuExtraOptions
            );
        };
        return subApi;
    };
    return api;
});