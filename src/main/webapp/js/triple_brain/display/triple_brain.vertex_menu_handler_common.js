/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.vertex_service",
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_menu",
    "triple_brain.mind_map_info"
], function ($, VertexService, GraphDisplayer, GraphElementMenu, MindMapInfo) {
    var api = {},
        forSingle = {};
    api.forSingle = function(){
        return forSingle;
    };
    forSingle.note = function (event, vertex) {
        var noteDialog = $(
            "<div>"
        ).attr(
            "title", vertex.text()
        ).append(
            $("<textarea rows='' cols=''>").append(
                vertex.getNote()
            )
        );
        var menuExtraOptions = {
            height: 350,
            width: 500,
            dialogClass: "vertex-note",
            modal: true
        };
        if(!MindMapInfo.isViewOnly()){
            menuExtraOptions.buttons = defineUpdateNoteButtonOptions(
                vertex
            );
        }
        GraphElementMenu.makeForMenuContentAndGraphElement(
            noteDialog,
            vertex,
            menuExtraOptions
        );
    };
    function defineUpdateNoteButtonOptions(vertex){
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
                    if (vertex.hasNote()) {
                        vertex.getNoteButtonInBubbleContent().show();
                        vertex.getNoteButtonInMenu().hide();
                    } else {
                        vertex.getNoteButtonInBubbleContent().hide();
                        vertex.getNoteButtonInMenu().show();
                    }
                    $(dialog).dialog("close");
                    vertex.readjustLabelWidth();
                }
            );
        };
        return buttonsOptions;
    }
    return api;
});