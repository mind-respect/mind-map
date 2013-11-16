/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.vertex",
    "triple_brain.mind-map_template",
    "triple_brain.link_to_far_vertex_menu",
    "triple_brain.graph_element_menu",
    "triple_brain.image_menu",
    "triple_brain.external_resource",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.included_graph_elements_menu",
    "triple_brain.delete_menu",
    "jquery-ui",
    "jquery.triple_brain.search"
], function ($, GraphDisplayer, VertexService, MindMapTemplate, LinkToFarVertexMenu, GraphElementMenu, ImageMenu, ExternalResource, UserMapAutocompleteProvider, FreebaseAutocompleteProvider, IncludedGraphElementsMenu, DeleteMenu) {
    var api = {};
    api.applyAutoCompleteIdentificationToLabelInput = function (input) {
        input.tripleBrainAutocomplete({
            limitNbRequests:true,
            select:function (event, ui) {
                var vertex = vertexOfSubHtmlComponent($(this));
                var identificationResource = ExternalResource.fromSearchResult(
                    ui.item
                );
                VertexService.addGenericIdentification(
                    vertex,
                    identificationResource
                );
            },
            resultsProviders:[
                UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnesForIdentification(
                    vertexOfSubHtmlComponent(input)
                ),
                FreebaseAutocompleteProvider.forFetchingAnything()
            ]
        });
    };
    api.setUpIdentifications = function (serverFormat, vertex) {
        setup(
            vertex.setTypes,
            "types",
            vertex.addType
        );
        setup(
            vertex.setSameAs,
            "same_as",
            vertex.addSameAs
        );
        setup(
            vertex.setGenericIdentifications,
            "generic_identifications",
            vertex.addGenericIdentification
        );
        function setup(identificationsSetter, identificationProperty, addFctn) {
            identificationsSetter([]);
            $.each(serverFormat[identificationProperty], function () {
                var identificationFromServer = this;
                addFctn(
                    ExternalResource.fromServerJson(
                        identificationFromServer
                    )
                );
            });
        }
    };
    api.addPlusButton = function (vertexMenu, clickBehavior) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-plus",
            clickBehavior
        );
    };
    api.addRemoveButtonIfApplicable = function (vertexMenu, deleteAfterConfirmationBehavior) {
        var vertex = vertexOfSubHtmlComponent(vertexMenu);
        if (vertex.isAbsoluteDefaultVertex()) {
            return;
        }
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-trash",
            clickBehavior
        );
        function clickBehavior() {
            DeleteMenu.ofVertexAndDeletionBehavior(
                vertexOfSubHtmlComponent(this),
                deleteAfterConfirmationBehavior
            ).build();
        }
    };
    api.addIncludedGraphElementsButton = function (vertexMenu) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-folder-open",
            clickBehavior
        );
        function clickBehavior() {
            var vertex = vertexOfSubHtmlComponent(this);
            IncludedGraphElementsMenu.ofVertex(
                vertex
            ).create();
        }
    };
    api.addWhatIsThisButton = function (vertexMenu, clickBehavior) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-info",
            clickBehavior
        );
    };
    api.addSuggestionsButton = function (vertexMenu, clickBehavior) {
        var button = makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-lightbulb",
            clickBehavior
        );
        button.addClass("suggestion");
        button.hide();
    };
    api.addCenterButton = function (vertexMenu, clickBehavior) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-home",
            clickBehavior
        );
    };
    api.addImageButton = function (vertexMenu) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-image",
            clickBehaviour
        );
        function clickBehaviour() {
            ImageMenu.ofVertex(
                vertexOfSubHtmlComponent(this)
            ).build();
        }
    };
    api.addNoteButton = function (vertex) {
        var noteButton = makeVertexMenuButtonUsingClass(
            vertex.getMenuHtml(),
            "ui-icon-note",
            clickBehaviour
        ).addClass("note-button");
        if (vertex.hasNote()) {
            vertex.label().before(
                noteButton
            );
        }
        return noteButton;
        function clickBehaviour() {
            var vertex = vertexOfSubHtmlComponent(this);
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
                        if (vertex.hasNote()) {
                            vertex.label()[
                                !GraphDisplayer.allowsMovingVertices() && vertex.isToTheLeft() ?
                                    "after" :
                                    "before"
                                ](
                                vertex.getMenuHtml().find(
                                    "> .note-button"
                                )
                            );
                        } else {
                            vertex.getTextContainer().find(
                                "> .note-button"
                            ).appendTo(
                                vertex.getMenuHtml()
                            );
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
        }
    };
    api.addLinkToFarVertexButton = function (vertexMenu) {
        return makeVertexMenuButtonUsingClass(
            vertexMenu,
            "ui-icon-arrowthick-1-e",
            clickBehaviour
        );
        function clickBehaviour() {
            var vertex = vertexOfSubHtmlComponent(this);
            LinkToFarVertexMenu.ofVertex(
                vertex
            ).create();
        }
    };
    api.addPrivacyManagementButton = function (vertexMenu) {
        var privacyManagementButton = $("<button>");
        vertexMenu.append(
            privacyManagementButton
        );
        var vertex = vertexOfSubHtmlComponent(vertexMenu);
        privacyManagementButton.data("vertex", vertex);
        vertex.isPublic() ?
            setupForPublic(privacyManagementButton) :
            setupForPrivate(privacyManagementButton);
        function setupForPublic(button) {
            button.button({
                icons:{
                    primary:"ui-icon ui-icon-unlocked"
                },
                text:false
            });
            button.off().on("click", function () {
                var button = $(this);
                var vertex = button.data("vertex");
                VertexService.makePrivate(vertex);
                setupForPrivate(button);
            });
        }

        function setupForPrivate(button) {
            button.button({
                icons:{
                    primary:"ui-icon ui-icon-locked"
                },
                text:false
            });
            button.off().on("click", function () {
                var button = $(this);
                var vertex = button.data("vertex");
                VertexService.makePublic(vertex);
                setupForPublic(button);
            });
        }
    };
    return api;

    function vertexOfSubHtmlComponent(htmlOfSubComponent) {
        return GraphDisplayer.getVertexSelector().withHtml(
            $(htmlOfSubComponent).closest('.vertex')
        );
    }

    function makeVertexMenuButtonUsingClass(vertexMenu, uiClass, clickBehaviour) {
        var button = $("<button>");
        vertexMenu.append(button);
        button.button({
            icons:{
                primary:"ui-icon " + uiClass
            },
            text:false
        });
        return button.on("click", clickBehaviour);
    }
});