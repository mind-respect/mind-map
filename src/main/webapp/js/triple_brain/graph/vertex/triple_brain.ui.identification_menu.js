/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.external_resource",
    "triple_brain.mind-map_template",
    "triple_brain.ui.graph",
    "triple_brain.id_uri",
    "triple_brain.freebase_autocomplete_provider",
    "triple_brain.user_map_autocomplete_provider",
    "triple_brain.graph_element_menu",
    "jquery-ui",
    "jquery.triple_brain.search"
],
    function ($, ExternalResource, MindMapTemplate, GraphUi, IdUriUtils, FreebaseAutocompleteProvider, UserMapAutocompleteProvider, GraphElementMenu) {
        var api = {
            ofGraphElement:function (graphElementUi) {
                return new IdentificationMenu(graphElementUi);
            }
        };

        function IdentificationMenu(graphElement) {
            var identificationMenu = this;
            var html;
            this.create = function () {
                html = $("<div>").addClass(
                    "identifications"
                );
                GraphUi.addHtml(html);
                buildMenu();
                html.data("graphElement", graphElement);
                GraphElementMenu.makeForMenuContentAndGraphElement(
                    html,
                    graphElement
                );
                return identificationMenu;
            };

            function listHtml() {
                return $(html).find(".list")
            }

            function listElements() {
                return $(listHtml()).find(".identification");
            }

            function buildMenu() {
                addTitle();
                addIdentifications();
                addInstructions();
                addIdentificationTextField().focus();
                if (graphElement.isConcept()) {
                    addTypeIdentificationTextField();
                }
            }

            function addTitle() {
                $(html).append(
                    MindMapTemplate['identification_menu_title'].merge()
                );
            }

            function addInstructions() {
                html.append(
                    $(
                        "<h3>"
                    ).attr(
                        "data-i18n",
                        (
                            graphElement.isConcept() ?
                                "vertex.menu.identification.instruction.concept" :
                                "vertex.menu.identification.instruction.relation"
                            )
                    )
                );
            }

            function addIdentifications() {
                var identitiesList = MindMapTemplate['identification_existing_identities'].merge();
                $(html).append(
                    identitiesList
                );
                $.each(graphElement.getIdentifications(), function () {
                    addIdentificationAsListElement(
                        this
                    );
                });
                makeListElementsCollapsible();
            }

            function makeListElementsCollapsible() {
                $(listHtml()).accordion().accordion("destroy");
                $(listHtml()).accordion({
                    collapsible:true,
                    active:false
                });
            }

            function addIdentificationAsListElement(identification) {
                var identificationListElement = MindMapTemplate[
                    'identification_existing_identity'
                    ].merge({
                        identification_uri:identification.uri(),
                        type_label:identification.label(),
                        description:identification.description()
                            .replace("\n", "<br/><br/>")
                    });
                $(identificationListElement).data("identification", identification);
                $(listHtml()).append(
                    identificationListElement
                );
                $(identificationListElement).find(".remove-button-in-list").click(function () {
                    var identificationListElement = $(this).closest(
                        '.identification'
                    );
                    var identification = identificationListElement.data(
                        "identification"
                    );
                    var semanticMenu = identificationListElement.closest(
                        '.identifications'
                    );
                    var graphElement = $(semanticMenu).data("graphElement");
                    var removeIdentification = identification.getType() == "type" ?
                        graphElement.serverFacade().removeType :
                        graphElement.serverFacade().removeSameAs;
                    removeIdentification.call(
                        this,
                        graphElement,
                        identification,
                        function (graphElement, identification) {
                            $.each(listElements(), function () {
                                var listElement = this;
                                var listElementIdentification = $(listElement).data("identification");
                                if (identification.uri() == listElementIdentification.uri()) {
                                    $(listElement).next(".description").remove();
                                    $(listElement).remove();
                                    return false;
                                }
                            });
                        }
                    )
                });
                return identificationListElement;
            }

            function setTemporaryDescription(identification) {
                $(
                    descriptionFromIdentification(
                        identification
                    )
                ).text(
                    identification.description()
                );
            }

            function descriptionFromIdentification(identification) {
                return $(
                    titleFromIdentification(identification)
                ).next(".description");
            }

            function titleFromIdentification(identification) {
                return $(html).find(
                    "[identification-uri='" + identification.uri() + "']"
                );
            }

            function addIdentificationTextField() {
                var identificationTextField = $(
                    MindMapTemplate[
                        'identification_textfield'
                        ].merge()
                );
                html.append(identificationTextField);
                setUpAutocomplete();
                return identificationTextField;
                function setUpAutocomplete() {
                    identificationTextField.tripleBrainAutocomplete({
                        select:function (event, ui) {
                            var semanticMenu = $(this).closest(
                                '.identifications'
                            );
                            var graphElement = $(semanticMenu).data("graphElement");
                            var searchResult = ui.item;
                            identifyUsingServerIdentificationFctn(
                                graphElement,
                                searchResult,
                                graphElement.serverFacade().addSameAs
                            );
                        },
                        resultsProviders:graphElement.isConcept() ?
                            getResultsProviderForVertex() :
                            getResultsProviderForRelations()
                    });
                    function getResultsProviderForVertex() {
                        return [
                            UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnes(),
                            FreebaseAutocompleteProvider.forFetchingAnything()
                        ];
                    }

                    function getResultsProviderForRelations() {
                        return [
                            UserMapAutocompleteProvider.toFetchRelations()
                        ];
                    }
                }
            }

            function addTypeIdentificationTextField() {
                var typeIdentificationTextField = MindMapTemplate[
                    'identification_type_textfield'
                    ].merge();
                $(html).append(typeIdentificationTextField);
                setUpAutocomplete();
                function setUpAutocomplete() {
                    typeIdentificationTextField.tripleBrainAutocomplete({
                        select:function (event, ui) {
                            var semanticMenu = $(this).closest('.identifications');
                            var graphElement = $(semanticMenu).data("graphElement");
                            var searchResult = ui.item;
                            identifyUsingServerIdentificationFctn(
                                graphElement,
                                searchResult,
                                graphElement.serverFacade().addType
                            );
                        },
                        resultsProviders:[
                            UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnes(),
                            FreebaseAutocompleteProvider.forFetchingTypes()
                        ]
                    });
                }

                return typeIdentificationTextField;
            }

            function identifyUsingServerIdentificationFctn(graphElement, searchResult, serverIdentificationFctn) {
                var identificationResource = ExternalResource.withUriLabelAndDescription(
                    searchResult.uri,
                    searchResult.label,
                    searchResult.description
                );
                serverIdentificationFctn(
                    graphElement,
                    identificationResource
                );
                addIdentificationAsListElement(identificationResource);
                makeListElementsCollapsible();
                setTemporaryDescription(identificationResource);
            }
        }

        return api;
    }
);