/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.vertex_service",
    "triple_brain.graph_displayer",
    "triple_brain.mind_map_info",
    "triple_brain.event_bus",
    "triple_brain.ui.graph",
    "bootstrap-wysiwyg",
    "bootstrap"
], function ($, VertexService, GraphDisplayer, MindMapInfo, EventBus, GraphUi) {
    "use strict";
    var api = {},
        forSingle = {};
    EventBus.subscribe(
        '/event/ui/mind_map_info/is_view_only',
        setUpSaveButton
    );
    api.forSingle = function () {
        return forSingle;
    };
    api._getBubbleNoteModal = function(){
        return $("#bubble-note-modal");
    };
    api._getContentEditor = function(){
        return api._getBubbleNoteModal().find(".editor");
    };
    forSingle.noteAction = function (graphElement) {
        var editor = api._getContentEditor().html(
            emptyHtmlIfHasMalicious(
                graphElement.getNote()
            )
        );
        api._getBubbleNoteModal().data(
            "graphElement", graphElement
        ).find(".bubble-label-in-title").text(
            graphElement.text()
        );
        getSaveButton().text($.t("vertex.menu.note.update"));
        api._getBubbleNoteModal().modal({
            backdrop: 'static',
            keyboard: false
        });
        if(MindMapInfo.isViewOnly()){
            api._getContentEditor().prop("content-editable", "false");
        }
        editor.wysiwyg({
            hotKeys: {
                'ctrl+b meta+b': 'bold',
                'ctrl+i meta+i': 'italic',
                'ctrl+u meta+u': 'underline',
                'ctrl+z meta+z': 'undo',
                'ctrl+y meta+y meta+shift+z': 'redo'
            }
        });
        editor.cleanHtml();
    };
    setUpCancelButton();
    initNoteModal();
    function setUpSaveButton() {
        if (MindMapInfo.isViewOnly()) {
            getSaveButton().addClass("hidden");
            return;
        }
        getSaveButton().click(function (event) {
            event.preventDefault();
            $(this).text(
                $.t("vertex.menu.note.saving") + " ..."
            );
            var graphElement = api._getBubbleNoteModal().data("graphElement");
            VertexService.updateNote(
                graphElement,
                api._getContentEditor().html(),
                function (graphElement) {
                    graphElement.getNoteButtonInBubbleContent()[
                        graphElement.hasNote() ?
                            "removeClass" :
                            "addClass"
                        ]("hidden");
                    hideNoteModal();
                }
            );
        });
    }

    function setUpCancelButton() {
        getCancelButton().click(function (event) {
            event.preventDefault();
            hideNoteModal();
        });
    }

    function getSaveButton() {
        return api._getBubbleNoteModal().find("button.save");
    }

    function getCancelButton() {
        return api._getBubbleNoteModal().find("button.cancel");
    }

    function hideNoteModal(){
        api._getBubbleNoteModal().modal("hide");
    }

    function initNoteModal(){
        api._getBubbleNoteModal().on('show.bs.modal', function () {
            GraphUi.disableDragScroll();
        }).on('hide.bs.modal', function () {
            GraphUi.enableDragScroll();
        });
        api._getBubbleNoteModal().find("input[data-edit=createLink]").click(function(event){
            event.stopPropagation();
        });
    }

    function emptyHtmlIfHasMalicious(html){
        var $html = $("<div>").append(html);
        var isMalicious = $html.find("script").length > 0 ||
            $html.find("iframe").length > 0;
        if(isMalicious){
            return "";
        }
        return html;
    }
    return api;
});