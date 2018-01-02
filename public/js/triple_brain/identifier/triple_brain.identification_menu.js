/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "jquery",
        "triple_brain.identification",
        "triple_brain.mind-map_template",
        "triple_brain.graph_ui",
        "triple_brain.id_uri",
        "triple_brain.wikidata_autocomplete_provider",
        "triple_brain.user_map_autocomplete_provider",
        "triple_brain.graph_element_menu",
        "triple_brain.search",
        "triple_brain.identification_context",
        "triple_brain.search_result",
        "triple_brain.mind_map_info",
        "triple_brain.suggestion_service",
        "triple_brain.schema_suggestion",
        "triple_brain.identified_to_service",
        "triple_brain.graph_element_type",
        "jquery.triple_brain.search",
        "jquery.i18next",
        "jquery.performance"
    ],
    function ($, Identification, MindMapTemplate, GraphUi, IdUri, WikidataAutocompleteProvider, UserMapAutocompleteProvider, GraphElementMenu, SearchService, IdentificationContext, SearchResult, MindMapInfo, SuggestionService, SchemaSuggestion, IdentifiedToService, GraphElementType) {
        "use strict";
        var api = {},
            DESCRIPTION_MAX_CHAR = 155;

        api.ofGraphElement = function (graphElementUi) {
            return new IdentificationMenu(graphElementUi);
        };

        api.setup = function(){
            if(MindMapInfo.isViewOnly()){
                return;
            }
        };

        api._handleClickReferences = function (event) {
            event.preventDefault();
            var anchor = $(this).disableAnchor();
            IdentifiedToService.getForIdentification(
                anchor.data("identification")
            ).then(function (searchResults) {
                var container = anchor.next(".references");
                var originalGraphElement = anchor.data("graphElement");
                $.each(searchResults, function () {
                    var searchResult = this;
                    if (searchResult.getGraphElement().getUri() === originalGraphElement.getUri()) {
                        return;
                    }
                    api._renderReference(
                        container, searchResult
                    );
                });
            });
        };

        api._renderReference = function (container, reference) {
            var graphElement = reference.getGraphElement();
            var li = $("<li class='list-group-item clearfix'>").append(
                $("<span class='element-label'>").text(
                    graphElement.getLabel()
                ),
                $("<div class='info'>").append(
                    $("<span class='type'>").text(
                        $.t("search.context." + reference.getDeepGraphElementType())
                    ),
                    $("<div class='distinction'>").text(
                        reference.getSomethingToDistinguish()
                    )
                )
            );
            if (reference.is(GraphElementType.Vertex) || reference.is(GraphElementType.Schema)) {
                li.addClass("clickable").data(
                    "uri", graphElement.getUri()
                ).click(function () {
                    window.location = IdUri.htmlUrlForBubbleUri(
                        $(this).data("uri")
                    );
                });
            }
            li.appendTo(container);
        };
        function IdentificationMenu(graphElement) {
            this.graphElement = graphElement;
            this.isViewOnly = MindMapInfo.isViewOnly() || graphElement.isGroupRelation();
        }

        IdentificationMenu.prototype.create = function () {
            var modal = api._getModal();
            this.html = modal.find(".identifications");
            this._buildMenu();
            this.html.data("graphElement", this.graphElement);
            modal.modal();
            modal.find(".bubble-label").text(
                this.graphElement.text()
            );
            if (this.identificationTextField) {
                GraphElementMenu.setupAutoCompleteSuggestionZIndex(
                    this.identificationTextField
                );
            }
            return this;
        };

        IdentificationMenu.prototype._buildMenu = function () {
            if (!this.isViewOnly) {
                this._setupIdentificationTextField();
            }
            this._addIdentifications();
        };

        IdentificationMenu.prototype._addIdentifications = function () {
            this._getMainListHtml().empty();
            var identifiers = this.graphElement.getModel().getRelevantTags();
            Object.keys(identifiers).forEach(function(key) {
                this._addIdentificationAsListElement(
                    identifiers[key]
                );
            }.bind(this));
        };

        IdentificationMenu.prototype._getMainListHtml = function () {
            return this.html.find(".list.main-list");
        };

        IdentificationMenu.prototype._addIdentificationAsListElement = function (identification) {
            var li = $(
                "<li class='list-group-item clearfix'>"
            ).data(
                "identification",
                identification
            );
            this._makeTitle(identification).then(function (title) {
                var description = this._makeDescription(identification);
                li.append(
                    this._makeImage(identification),
                    title,
                    description,
                    this._makeOrigin(identification),
                    this._makeReferencesContainer(identification)
                );
                this._getMainListHtml().append(
                    li
                );
            }.bind(this));
        };

        IdentificationMenu.prototype._makeImage = function (identification) {
            var container = $("<div class='img-container'>");
            if (identification.hasImages()) {
                $("<img>").prop(
                    "src",
                    identification.getImages()[0].getBase64ForSmall()
                ).appendTo(container);
            }
            return container;
        };

        IdentificationMenu.prototype._makeDescription = function (identification) {
            var description = identification.getComment()
                .replace("\n", "<br/><br/>");
            var beginingDescriptionText = description.length > DESCRIPTION_MAX_CHAR ?
                description.substr(
                    0,
                    description.indexOf(" ", DESCRIPTION_MAX_CHAR)
                ) : description;
            var beginningDescription = $("<span>").append(
                beginingDescriptionText
            );
            var endDescription = $("<div class='end-description hidden'>").append(
                description.substr(
                    beginingDescriptionText.length + 1
                )
            );
            var container = $("<div class='group list-group-item-text description'>").append(
                beginningDescription
            );
            if (description.length > DESCRIPTION_MAX_CHAR) {
                $("<span class='read-more'>").append(
                    $(
                        "<a href='#' data-i18n='graph_element.menu.identification.readMore'>"
                    ).click(function (event) {
                            event.preventDefault();
                            var $this = $(this);
                            var collapsible = $this.closest('.description').find(
                                '.end-description'
                            ).toggleClass('hidden');
                            $this.text(
                                $.t(
                                    collapsible.is(":visible") ?
                                        "graph_element.menu.identification.readLess" :
                                        "graph_element.menu.identification.readMore"
                                )
                            );
                        }
                    )
                ).appendTo(container);
            }
            container.append(endDescription);
            return container;
        };

        IdentificationMenu.prototype._makeTitle = function (identification) {
            var deferred = $.Deferred();
            var self = this;
            deferred.resolve(
                buildTitleWithUrl(
                    IdUri.htmlUrlForBubbleUri(
                        identification.getUri()
                    )
                )
            );
            return deferred.promise();
            function buildTitleWithUrl(url) {
                var anchor = $("<a target=_blank>").prop(
                    "href",
                    url
                ).append(
                    identification.isLabelEmpty() ?
                        identification.getUri() :
                        identification.getLabel()
                );
                var title = $(
                    "<h3 class='list-group-item-heading'>"
                ).append(
                    anchor
                );
                if (!self.isViewOnly) {
                    title.append(
                        self._makeRemoveButton()
                    );
                }
                return title;
            }
        };

        IdentificationMenu.prototype._makeOrigin = function (identification) {
            var url = identification.getExternalResourceUri();
            var origin = IdUri.hostNameOfUri(url);
            if (IdUri.isUriOfAGraphElement(url)) {
                origin = window.location.hostname;
            }
            return $(
                "<div class='origin-container'>"
            ).append(
                $("<small>").append(
                    $.t(
                        "graph_element.menu.identification.origin"
                    ) + ": ",
                    $("<a target='_blank'>").prop("href", "http://" + origin).text(origin)
                )
            );
        };

        IdentificationMenu.prototype._makeReferencesContainer = function (identification) {
            var numberOfOtherReferences = identification.getNbReferences() - 1;
            var container = $(
                "<div class='references-container'>"
            );
            if (numberOfOtherReferences > 0) {
                $("<a href='#'>").data(
                    "identification", identification
                ).data(
                    "graphElement",
                    this.graphElement
                ).text(
                    numberOfOtherReferences + " " +
                    $.t(
                        "graph_element.menu.identification.nb_references"
                    )
                ).click(api._handleClickReferences).appendTo(container);
                container.append("<ul class='references list list-group'>");
            } else {
                container.text(
                    $.t(
                        "graph_element.menu.identification.no_other_references"
                    )
                );
            }
            return container;
        };

        IdentificationMenu.prototype._setupIdentificationTextField = function () {
            var identificationTextField = api._getModal().find(".add-identification");
            identificationTextField.val("");
            this._setUpAutoComplete(identificationTextField);
            this.identificationTextField = identificationTextField;
            this.identificationTextField.attr('tabindex',-1);
            return identificationTextField;
        };

        IdentificationMenu.prototype._setUpAutoComplete = function (identificationTextField) {
            var self = this;
            identificationTextField.tripleBrainAutocomplete({
                select: function (event, ui) {
                    var semanticMenu = $(this).closest(
                        '.identifications'
                        ),
                        searchResult = ui.item;
                    self._handleSelectIdentification(
                        searchResult,
                        semanticMenu.data("graphElement")
                    );
                },
                resultsProviders: this.graphElement.isVertex() ?
                    this._getResultsProvidersForVertex() :
                    this._getResultsProvidersForRelations()
            });
        };

        IdentificationMenu.prototype._handleSelectIdentification = function (searchResult, graphElement) {
            var identifier = Identification.fromSearchResult(
                searchResult
            );
            identifier.makeGeneric();
            if (graphElement.getModel().hasIdentification(identifier)) {
                return false;
            }
            var self = this;
            SchemaSuggestion.addSchemaSuggestionsIfApplicable(
                graphElement,
                searchResult.uri
            );
            if (graphElement.isSuggestion()) {
                var vertexSuggestion = graphElement.isRelationSuggestion() ?
                    graphElement.childVertexInDisplay() : graphElement;
                vertexSuggestion.getController().accept(vertexSuggestion).then(
                    identify
                );
            } else {
                identify();
            }
            return identifier;
            function identify() {
                graphElement.getController().addIdentification(
                    identifier
                ).then(function (identifications) {
                    $.each(identifications, function () {
                        self._addIdentificationAsListElement(this);
                    });
                });
            }
        };

        IdentificationMenu.prototype._getResultsProvidersForVertex = function () {
            return [
                UserMapAutocompleteProvider.toFetchPublicAndUserVerticesExcept(this.graphElement),
                WikidataAutocompleteProvider.buildWithIsActiveCondition(function(){
                    return true;
                })
            ];
        };
        IdentificationMenu.prototype._getResultsProvidersForRelations = function () {
            return [
                UserMapAutocompleteProvider.toFetchRelationsForIdentification(this.graphElement),
                WikidataAutocompleteProvider.build()
            ];
        };

        IdentificationMenu.prototype._makeRemoveButton = function () {
            var container = $("<span class='pull-right'>");
            var button = $(
                "<button class='btn remove-btn'>"
            ).append(
                "<i class='fa fa-trash-o'>"
            ).appendTo(container).click(
                function (event) {
                    event.stopPropagation();
                    var identificationListElement = $(this).closest(
                        'li'
                        ),
                        identification = identificationListElement.data(
                            "identification"
                        ),
                        graphElement = identificationListElement.closest(
                            '.identifications'
                        ).data("graphElement");
                    identificationListElement.remove();
                    graphElement.getController().removeIdentifier(
                        identification
                    );
                }
            );
            return container;
        };
        api._getModal = function(){
            return $("#identifiers-menu");
        };
        api._getModal().on('shown.bs.modal', function () {
            $(this).find(".add-identification").focus();
        });
        return api;
    }
);