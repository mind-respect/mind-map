/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.search",
    "triple_brain.graph_displayer",
    "triple_brain.search_result",
    "triple_brain.graph_element_type",
    "triple_brain.graph_element",
    "jquery.i18next"
], function ($, SearchService, GraphDisplayer, SearchResult, GraphElementType, GraphElement) {
    var api = {};
    api.build = function (searchResult, callback) {
        return new Self(
            searchResult, true
        ).build(callback);
    };
    api.buildWithoutBubbleLinks = function (searchResult, callback) {
        return new Self(
            searchResult, false
        ).build(callback);
    };

    function Self(searchResult, makeBubbleLinks) {
        this.originalSearchResult = searchResult;
        this.makeBubbleLinks = makeBubbleLinks;
    }

    Self.prototype.build = function (callback) {
        var self = this;
        SearchService.getSearchResultDetails(
            this.originalSearchResult.getGraphElement().getUri(),
            function (detailedSearchResult) {
                self.detailedGraphElement = GraphElement.fromDetailedSearchResult(
                    detailedSearchResult
                );
                callback(
                    self._buildHtmlContext(),
                    self._getImageUrl()
                )
            }
        );
    };

    Self.prototype._buildHtmlContext = function () {
        switch (this.originalSearchResult.getGraphElementType()) {
            case GraphElementType.Vertex :
                return this._makeBubbleContext();
            case GraphElementType.Schema :
                return this._makeBubbleContext();
            case GraphElementType.Relation :
                return this._makeRelationContext();
            case GraphElementType.Property :
                return this._makePropertyContext();
            default:
                return $("<div>");
        }
    };

    Self.prototype._makeBubbleContext = function () {
        var vertex = this.detailedGraphElement,
            tPreString = "identification.context",
            context = $("<div class='context'>").append(
                $.t(tPreString + ".bubble"),
                ": ",
                this.makeBubbleLinks ? this._vertexLink(this.detailedGraphElement) :
                    vertex.getLabel(),
                " "
            );
        this._addCommentToContext(
            context
        );
        return context
    };

    Self.prototype._addCommentToContext = function (context) {
        context.append(
            $("<div>").append(
                this.detailedGraphElement.getComment()
            )
        );
    };

    Self.prototype._getImageUrl = function () {
        if (!this.detailedGraphElement.hasImages()) {
            return "";
        }
        return this.detailedGraphElement.getImages()[0].getBase64ForSmall();
    };

    Self.prototype._makeRelationContext = function () {
        var relation = this.originalSearchResult.getGraphElement();
        var sourceVertex = relation.getSourceVertex(),
            destinationVertex = relation.getDestinationVertex();
        var context = $("<div class='context'>").append(
            $.t("vertex.search.destination_bubble") + ": ",
            this.makeBubbleLinks ?
                this._vertexLink(destinationVertex) :
                destinationVertex.getLabel(),
            "<br>",
            $.t("vertex.search.source_bubble") + ": ",
            this.makeBubbleLinks ?
                this._vertexLink(sourceVertex) :
                sourceVertex.getLabel()
        );
        this._addCommentToContext(
            context
        );
        return context;
    };

    Self.prototype._makePropertyContext = function () {
        var context = $("<div>");
        this._addCommentToContext(
            context
        );
        return context;
    };
    Self.prototype._vertexLink = function () {
        return $("<button class='link-like-button'>").append(
            this.detailedGraphElement.getLabel()
        ).data(
            "identificationUri",
            this.detailedGraphElement.getUri()
        ).on(
            "click",
            function (event) {
                event.preventDefault();
                event.stopPropagation();
                var identificationUri = $(this).data("identificationUri");
                GraphDisplayer.displayForBubbleWithUri(
                    identificationUri
                );
            }
        );
    };

    return api;
})
;