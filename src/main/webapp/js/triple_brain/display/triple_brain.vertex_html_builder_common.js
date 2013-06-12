/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "jquery-ui"
], function($, Vertex, VertexService, MindMapTemplate){
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
                    "Save": function() {
                        var dialog = $(this);
                        VertexService.updateNote(
                            vertex,
                            dialog.find("textarea").val()
                        )
                    }
                }
            });
        });
    };
    return api;

    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return Vertex.withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }
});