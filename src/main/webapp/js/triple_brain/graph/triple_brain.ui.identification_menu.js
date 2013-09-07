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
                                "graph_element.menu.identification.instruction.concept" :
                                "graph_element.menu.identification.instruction.relation"
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
                    getServerRemoveIdentificationFunction()(
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
                    );
                    function getServerRemoveIdentificationFunction(){
                        switch(identification.getType()){
                            case "type" :
                                return graphElement.serverFacade().removeType;
                            case "same_as" :
                                return graphElement.serverFacade().removeSameAs;
                            default :
                                return graphElement.serverFacade().removeGenericIdentification;
                        }
                    }
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
                                getServerIdentificationFctn()
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
                    function getServerIdentificationFctn(){
                        return graphElement.isConcept() ?
                            graphElement.serverFacade().addGenericIdentification :
                            graphElement.serverFacade().addSameAs;
                    }
                }
            }

            function identifyUsingServerIdentificationFctn(graphElement, searchResult, serverIdentificationFctn) {
                var identificationResource = ExternalResource.fromSearchResult(
                    searchResult
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