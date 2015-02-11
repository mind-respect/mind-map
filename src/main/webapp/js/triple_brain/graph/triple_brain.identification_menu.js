/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
        "jquery",
        "triple_brain.identification",
        "triple_brain.mind-map_template",
        "triple_brain.ui.graph",
        "triple_brain.id_uri",
        "triple_brain.freebase_autocomplete_provider",
        "triple_brain.user_map_autocomplete_provider",
        "triple_brain.graph_element_menu",
        "triple_brain.search",
        "triple_brain.identification_context",
        "triple_brain.search_result",
        "triple_brain.mind_map_info",
        "triple_brain.suggestion_service",
        "triple_brain.schema_suggestion",
        "jquery-ui",
        "jquery.triple_brain.search"
    ],
    function ($, Identification, MindMapTemplate, GraphUi, IdUri, FreebaseAutocompleteProvider, UserMapAutocompleteProvider, GraphElementMenu, SearchService, IdentificationContext, SearchResult, MindMapInfo, SuggestionService, SchemaSuggestion) {
        var api = {
            ofGraphElement: function (graphElementUi) {
                return new IdentificationMenu(graphElementUi);
            }
        };

        function IdentificationMenu(graphElement) {
            this.graphElement = graphElement;
        }

        IdentificationMenu.prototype.create = function () {
            this.html = $(
                "<div class='identifications'>"
            ).data("facade", this);
            GraphUi.addHtml(this.html);
            this._buildMenu();
            this.html.data("graphElement", this.graphElement);
            GraphElementMenu.makeForMenuContentAndGraphElement(
                this.html,
                this.graphElement,{
                    height: 350,
                    width: 550
                }
            );
            return this;
        };

        IdentificationMenu.prototype._buildMenu = function () {
            this._addTitle();
            this._addIdentifications();
            if (MindMapInfo.isViewOnly()) {
                return;
            }
            this._addInstructions();
            this._addIdentificationTextField().focus();
        };
        IdentificationMenu.prototype._addTitle = function () {
            this.html.append(
                MindMapTemplate['identification_menu_title'].merge()
            );
        };

        IdentificationMenu.prototype._addInstructions = function () {
            this.html.append(
                $(
                    "<h3>"
                ).attr(
                    "data-i18n",
                    (
                        this.graphElement.isVertex() ?
                            "graph_element.menu.identification.instruction.concept" :
                            "graph_element.menu.identification.instruction.relation"
                        )
                )
            );
        };

        IdentificationMenu.prototype._addIdentifications = function () {
            var identitiesList = MindMapTemplate['identification_existing_identities'].merge(),
                self = this;
            this.html.append(
                identitiesList
            );
            $.each(this.graphElement.getIdentifications(), function () {
                self._addIdentificationAsListElement(
                    this
                );
            });
            this._makeListElementsCollapsible();
        };

        IdentificationMenu.prototype._getListHtml = function () {
            return this.html.find(".list")
        };

        IdentificationMenu.prototype._listElements = function () {
            return this._getListHtml().find(".identification");
        };

        IdentificationMenu.prototype._makeListElementsCollapsible = function () {
            var listHtml = this._getListHtml();
            listHtml.accordion().accordion("destroy");
            listHtml.accordion({
                collapsible: true,
                active: false,
                heightStyle: "content"
            });
        };

        IdentificationMenu.prototype._addIdentificationAsListElement = function (identification) {
            var title = this._makeTitle(identification);
            var description = this._makeDescription(identification);
            this._getListHtml().append(
                title,
                description
            );
            return $(title, description);
        };

        IdentificationMenu.prototype._makeDescription = function (identification) {
            return $(
                "<div class='group description'>"
            ).append(
                identification.getComment()
                    .replace("\n", "<br/><br/>")
            );
        };

        IdentificationMenu.prototype._makeTitle = function (identification) {
            return $(
                "<h3 class='type-label identification'>"
            ).attr(
                "identification-uri", identification.getUri()
            ).append(
                identification.isLabelEmpty() ?
                    identification.getUri() :
                    identification.getLabel()
            ).append(
                this._makeRemoveButton()
            ).data(
                "identification",
                identification
            ).on(
                "click",
                function () {
                    var title = $(this);
                    addContextIfApplicable();
                    function addContextIfApplicable() {
                        var context = title.data("has_context"),
                            facade = title.closest(".identifications").data("facade");
                        if (context === undefined) {
                            title.data(
                                "has_context",
                                true
                            );
                            var identification = title.data("identification");
                            if (!identification.isEligibleForContext()) {
                                return;
                            }
                            facade._addContextInContainer(
                                identification,
                                facade._descriptionDivFromTitleDiv(title)
                            );
                        }
                    }
                }
            );
        };

        IdentificationMenu.prototype._addContextInContainer = function (identification, container) {
            var self = this;
            var externalResourceUri = identification.isExternalResourceASchemaProperty() ?
                IdUri.schemaUriOfProperty(identification.getExternalResourceUri()) :
                identification.getExternalResourceUri();
            SearchService.getSearchResultDetails(
                externalResourceUri,
                function (searchResult) {
                    IdentificationContext.build(
                        SearchResult.fromServerFormat(
                            searchResult
                        ),
                        function (context) {
                            container.prepend(
                                context
                            );
                            self._getListHtml().accordion("refresh");
                        }
                    );
                }
            );
        };
        IdentificationMenu.prototype._descriptionDivFromTitleDiv = function (title) {
            return title.next(".description")
        };
        IdentificationMenu.prototype._setTemporaryDescription = function (identification) {
            $(
                this._descriptionFromIdentification(
                    identification
                )
            ).text(
                identification.getComment()
            );
        };

        IdentificationMenu.prototype._descriptionFromIdentification = function (identification) {
            return this._descriptionDivFromTitleDiv(
                this._titleFromIdentification(identification)
            );
        };

        IdentificationMenu.prototype._titleFromIdentification = function (identification) {
            return this.html.find(
                    "[identification-uri='" + identification.getUri() + "']"
            );
        };

        IdentificationMenu.prototype._addIdentificationTextField = function () {
            var identificationTextField = $(
                MindMapTemplate[
                    'identification_textfield'
                    ].merge()
            );
            this.html.append(identificationTextField);
            this._setUpAutoComplete(identificationTextField);
            return identificationTextField;
        };

        IdentificationMenu.prototype._setUpAutoComplete = function (identificationTextField) {
            var self = this;
            identificationTextField.tripleBrainAutocomplete({
                select: function (event, ui) {
                    var semanticMenu = $(this).closest(
                            '.identifications'
                        ),
                        graphElement = $(semanticMenu).data("graphElement"),
                        searchResult = ui.item;
                    SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                        graphElement,
                        searchResult
                    );
                    if(graphElement.isSuggestion()){
                        var vertexSuggestion = graphElement.isRelationSuggestion() ?
                            graphElement.childVertexInDisplay() : graphElement;
                        SuggestionService.accept(
                            vertexSuggestion,
                            identify
                        );
                    }else{
                        identify();
                    }
                    function identify(){
                        self._identifyUsingServerIdentificationFctn(
                            graphElement,
                            searchResult,
                            self._getServerIdentificationFctn()
                        );
                    }
                },
                resultsProviders: this.graphElement.isVertex() ?
                    this._getResultsProvidersForVertex() :
                    this._getResultsProvidersForRelations()
            });
        };

        IdentificationMenu.prototype._getResultsProvidersForVertex = function(){
            return [
                UserMapAutocompleteProvider.toFetchCurrentUserVerticesAndPublicOnesForIdentification(this.graphElement),
                FreebaseAutocompleteProvider.forFetchingAnything()
            ];
        };
        IdentificationMenu.prototype._getResultsProvidersForRelations = function() {
            return [
                UserMapAutocompleteProvider.toFetchRelationsForIdentification(this.graphElement),
                FreebaseAutocompleteProvider.forFetchingAnything()
            ];
        };

        IdentificationMenu.prototype._getServerIdentificationFctn = function() {
            var graphElement = this.graphElement;
            return this.graphElement.isVertex() ? function (concept, identificationResource) {
                graphElement.serverFacade().addGenericIdentification(concept, identificationResource);
                graphElement.refreshImages();
            } : graphElement.serverFacade().addSameAs;
        };

        IdentificationMenu.prototype._makeRemoveButton = function () {
            return $(
                "<button class='remove-button-in-list'>"
            ).append(
                "x"
            ).click(function (event) {
                    event.stopPropagation();
                    var identificationListElement = $(this).closest(
                            '.identification'
                        ),
                        identification = identificationListElement.data(
                            "identification"
                        ),
                        semanticMenu = identificationListElement.closest(
                            '.identifications'
                        ),
                        graphElement = semanticMenu.data("graphElement"),
                        facade = semanticMenu.data("facade");
                    getServerRemoveIdentificationFunction()(
                        graphElement,
                        identification,
                        function (graphElement, identification) {
                            $.each(facade._listElements(), function () {
                                var listElement = $(this),
                                    listElementIdentification = listElement.data("identification");
                                if (identification.getUri() === listElementIdentification.getUri()) {
                                    listElement.next(".description").remove();
                                    listElement.remove();
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
        };

        IdentificationMenu.prototype._identifyUsingServerIdentificationFctn = function(graphElement, searchResult, serverIdentificationFctn) {
            var identificationResource = Identification.fromSearchResult(
                searchResult
            );
            serverIdentificationFctn(
                graphElement,
                identificationResource
            );
            this._addIdentificationAsListElement(identificationResource);
            this._makeListElementsCollapsible();
            this._setTemporaryDescription(identificationResource);
        };
        return api;
    }
);