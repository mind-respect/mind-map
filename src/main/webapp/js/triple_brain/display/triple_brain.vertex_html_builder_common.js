/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.ui.vertex",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.link_to_far_vertex_menu",
    "triple_brain.graph_element_menu",
    "jquery-ui"
], function($, Vertex, VertexService, MindMapTemplate, LinkToFarVertexMenu, GraphElementMenu){
    var api = {};
    api.addPlusButton = function(vertexMenu, clickBehavior){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-plus",
            clickBehavior
        );
    };
    api.addRemoveButton = function(vertexMenu, clickBehavior){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-trash",
            clickBehavior
        );
    };
    api.addWhatIsThisButton = function(vertexMenu, clickBehavior){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-info",
            clickBehavior
        );
    };
    api.addSuggestionsButton = function(vertexMenu, clickBehavior){
        var button = makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-lightbulb",
            clickBehavior
        );
        button.addClass("suggestion");
        button.hide();
    };
    api.addCenterButton = function(vertexMenu, clickBehavior){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-home",
            clickBehavior
        );
    };
    api.addNoteButton = function(vertexMenu){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-note",
            clickBehaviour
        );
        function clickBehaviour(){
            var vertex = vertexOfSubHtmlComponent(this);
            var noteDialog = $("<div title='"+vertex.text()+"'></div>");
            noteDialog.append(
                "<textarea rows='' cols=''>"+
                    vertex.getNote() +
                    "</textarea>"
            );
            var buttonsOptions = {};
            buttonsOptions[$.t("vertex.menu.note.update")] = function(event) {
                var dialog = $(this);
                var textContainer = $(event.currentTarget).find(".ui-button-text");
                textContainer.text(
                    $.t("vertex.menu.note.saving") + " ..."
                );
                VertexService.updateNote(
                    vertex,
                    dialog.find("textarea").val(),
                    function(){
                        $(dialog).dialog("close");
                    }
                );
            };
            var menuExtraOptions = {
                height:350,
                width:500,
                dialogClass: "vertex-note",
                modal:true,
                buttons: buttonsOptions
            };
            GraphElementMenu.makeForMenuContentAndGraphElement(
                noteDialog,
                vertex,
                menuExtraOptions
            );
        }
    };
    api.addLinkToFarVertexButton = function(vertexMenu){
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-arrowthick-1-e",
            clickBehaviour
        );
        function clickBehaviour(){
            var vertex = vertexOfSubHtmlComponent(this);
            LinkToFarVertexMenu.ofVertex(
                vertex
            ).create();
        }
    };
    api.addPrivacyManagementButton = function(vertexMenu){
        var privacyManagementButton = $("<button>");
        vertexMenu.append(
            privacyManagementButton
        );
        var vertex = vertexOfSubHtmlComponent(vertexMenu);
        privacyManagementButton.data("vertex", vertex);
        vertex.isPublic() ?
            setupForPublic(privacyManagementButton) :
            setupForPrivate(privacyManagementButton);
        function setupForPublic(button){
            button.button({
                icons: {
                    primary: "ui-icon ui-icon-unlocked"
                },
                text: false
            });
            button.off().on("click", function(){
                var button = $(this);
                var vertex = button.data("vertex");
                VertexService.makePrivate(vertex);
                setupForPrivate(button);
            });
        }
        function setupForPrivate(button){
            button.button({
                icons: {
                    primary: "ui-icon ui-icon-locked"
                },
                text: false
            });
            button.off().on("click", function(){
                var button = $(this);
                var vertex = button.data("vertex");
                VertexService.makePublic(vertex);
                setupForPublic(button);
            });
        }
    };
    return api;

    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return Vertex.withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }

    function makeVertexMenuButtonUsingClass(vertexMenu, uiClass, clickBehaviour){
        var button = $("<button>");
        vertexMenu.append(button);
        button.button({
            icons: {
                primary: "ui-icon " + uiClass
            },
            text: false
        });
        return button.on("click", clickBehaviour);
    }
});