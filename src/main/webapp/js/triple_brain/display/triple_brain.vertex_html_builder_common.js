/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.link_to_far_vertex_menu",
    "jquery-ui"
], function($, Vertex, VertexService, MindMapTemplate, LinkToFarVertexMenu){
    var api = {};
    api.addNoteButton = function(vertexMenu){
        var noteButton = MindMapTemplate['vertex_note_button'].merge();
        $(vertexMenu).append(noteButton);
        $(noteButton).button({
            icons: {
                primary: "ui-icon ui-icon-note"
            },
            text: false
        });
        noteButton.click(function(){
            var vertex = vertexOfSubHtmlComponent(this);
            var noteDialog = $("<div title='"+vertex.text()+"'></div>");
            noteDialog.append(
                "<textarea rows='' cols=''>"+
                    vertex.getNote() +
                    "</textarea>"
            );
            noteDialog.dialog({
                height:350,
                width:500,
                dialogClass: "vertex-note",
                modal:true,
                buttons: {
                    "Update": function(event) {
                        var dialog = $(this);
                        var textContainer = $(event.currentTarget).find(".ui-button-text");
                        textContainer.text("Saving ...");
                        VertexService.updateNote(
                            vertex,
                            dialog.find("textarea").val(),
                            function(){
                                $(dialog).dialog("close");
                            }
                        )
                    }
                }
            });
        });
    };
    api.addLinkToFarVertexButton = function(vertexMenu){
        var linkToFarVertexButton = MindMapTemplate[
            'vertex_link_to_far_vertex_button'
            ].merge();
        vertexMenu.append(
            linkToFarVertexButton
        );
        linkToFarVertexButton.button({
            icons: {
                primary: "ui-icon ui-icon-arrowthick-1-e"
            },
            text: false
        });
        linkToFarVertexButton.click(function(){
            var vertex = vertexOfSubHtmlComponent(this);
            var linkToFarVertexMenu = LinkToFarVertexMenu.ofVertex(
                vertex
            ).create();
        });
    };
    return api;

    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return Vertex.withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }
});