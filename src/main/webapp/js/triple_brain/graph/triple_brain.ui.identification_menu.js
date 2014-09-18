/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.identification_server_facade",
        "triple_brain.mind-map_template",
        "triple_brain.ui.graph",
        "triple_brain.id_uri",
        "triple_brain.freebase_autocomplete_provider",
        "triple_brain.user_map_autocomplete_provider",
        "triple_brain.graph_element_menu",
        "triple_brain.search",
        "triple_brain.identification_context",
        "triple_brain.search_result_facade_factory",
        "triple_brain.mind_map_info",
        "jquery-ui",
        "jquery.triple_brain.search"
    ],
    function ($, IdentificationFacade, MindMapTemplate, GraphUi, IdUriUtils, FreebaseAutocompleteProvider, UserMapAutocompleteProvider, GraphElementMenu, SearchService, IdentificationContext, SearchResultFacadeFactory, MindMapInfo) {
        return {
            ofGraphElement: function (graphElementUi) {
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

            function getListHtml() {
                return $(html).find(".list")
            }

            function listElements() {
                return getListHtml().find(".identification");
            }

            function buildMenu() {
                addTitle();
                addIdentifications();
                if (MindMapInfo.isViewOnly()) {
                    return;
                }
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
                            graphElement.isVertex() ?
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
                var listHtml = getListHtml();
                listHtml.accordion().accordion("destroy");
                listHtml.accordion({
                    collapsible: true,
                    active: false,
                    heightStyle: "content"
                });
            }

            function addIdentificationAsListElement(identification) {
                var title = makeTitle();
                var description = makeDescription();
                getListHtml().append(
                    title,
                    description
                );
                return $(title, description);
                function makeTitle() {
                    return $(
                        "<h3 class='type-label identification'>"
                    ).attr(
                        "identification-uri", identification.getUri()
                    ).append(
                        identification.getLabel()
                    ).append(
                        makeRemoveButton()
                    ).data(
                        "identification",
                        identification
                    ).on(
                        "click",
                        function () {
                            var title = $(this);
                            addContextIfApplicable();
                            function addContextIfApplicable() {
                                var identification = title.data("identification");
                                if (!identification.isARelationOrVertex()) {
                                    return;
                                }
                                var context = title.data("has_context");
                                if (context === undefined) {
                                    title.data(
                                        "has_context",
                                        true
                                    );
                                    SearchService.getSearchResultByUri(
                                        identification.getExternalResourceUri(),
                                        function (searchResult) {
                                            IdentificationContext.build(
                                                SearchResultFacadeFactory.get(
                                                    searchResult
                                                ),
                                                function (context) {
                                                    descriptionDivFromTitleDiv(title).prepend(
                                                        context
                                                    );
                                                    getListHtml().accordion("refresh");
                                                }
                                            );
                                        }
                                    );
                                }
                            }
                        }
                    );
                    function makeRemoveButton() {
                        return $(
                            "<button class='remove-button-in-list'>"
                        ).append(
                            "x"
                        ).click(function (event) {
                                event.stopPropagation();
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
                                            if (identification.getUri() === listElementIdentification.getUri()) {
                                                $(listElement).next(".description").remove();
                                                $(listElement).remove();
                                                return false;
                                            }
                                        });
                                    }
                                );
                                function getServerRemoveIdentificationFunction() {
                                    switch (identification.getType()) {
                                        case "type" :
                                            return graphElement.serverFacade().removeType;
                                        case "same_as" :
                                            return graphElement.serverFacade().removeSameAs;
                                        default :
                                            return graphElement.serverFacade().removeGenericIdentification;
                                    }
                                }
                            }
                        );
                    }
                }

                function makeDescription() {
                    return $(
                        "<div class='group description'>"
                    ).append(
                        identification.getComment()
                            .replace("\n", "<br/><br/>")
                    );
                }
            }


            function setTemporaryDescription(identification) {
                $(
                    descriptionFromIdentification(
                        identification
                    )
                ).text(
                    identification.getComment()
                );
            }

            function descriptionDivFromTitleDiv(title) {
                return title.next(".description")
            }

            function descriptionFromIdentification(identification) {
                return descriptionDivFromTitleDiv(
                    titleFromIdentification(identification)
                );
            }

            function titleFromIdentification(identification) {
                return $(html).find(
                        "[identification-uri='" + identification.getUri() + "']"
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
                        select: function (event, ui) {
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
                        resultsProviders: graphElement.isVertex() ?
                            getResultsProvidersForVertex() :
                            getResultsProvidersForRelations()
                    });
                    function getResultsProvidersForVertex() {
                        return [
                            UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnesForIdentification(graphElement),
                            FreebaseAutocompleteProvider.forFetchingAnything()
                        ];
                    }

                    function getResultsProvidersForRelations() {
                        return [
                            UserMapAutocompleteProvider.toFetchRelationsForIdentification(graphElement),
                            FreebaseAutocompleteProvider.forFetchingAnything()
                        ];
                    }

                    function getServerIdentificationFctn() {
                        return graphElement.isVertex() ? function (concept, identificationResource) {
                            graphElement.serverFacade().addGenericIdentification(concept, identificationResource);
                            graphElement.refreshImages();
                        } : graphElement.serverFacade().addSameAs;
                    }
                }
            }

            function identifyUsingServerIdentificationFctn(graphElement, searchResult, serverIdentificationFctn) {
                var identificationResource = IdentificationFacade.fromSearchResult(
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
    }
);