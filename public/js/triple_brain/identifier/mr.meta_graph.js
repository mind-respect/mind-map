/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
        "triple_brain.sub_graph"
    ], function (SubGraph) {
        "use strict";
        var api = {};
        api.fromServerFormatAndCenterUri = function (serverFormat, centerUri) {
            return new api.MetaGraph(
                serverFormat,
                centerUri
            );
        };
        api.MetaGraph = function (serverFormat, centerUri) {
            this.subGraph = SubGraph.fromServerFormat(serverFormat);
            this.centerUri = centerUri;
            this.metaCenter = this._getMetaCenter();
        };

        api.MetaGraph.prototype.getMetaCenter = function () {
            return this.metaCenter;
        };

        api.MetaGraph.prototype.setMetaCenter = function (metaCenter) {
            return this.metaCenter = metaCenter;
        };

        api.MetaGraph.prototype.getSubGraph = function () {
            return this.subGraph;
        };

        api.MetaGraph.prototype._getMetaCenter = function () {
            var centerMeta;
            this.subGraph.visitGraphElements(function (graphElement) {
                graphElement.getIdentifiersIncludingSelf().forEach(function (identifier) {
                    if (identifier.getUri() === this.centerUri) {
                        centerMeta = identifier;
                    }
                }.bind(this));
            }.bind(this));
            return centerMeta;
        };
        api.MetaGraph.prototype.getCenterUri = function () {
            return this.centerUri;
        };
        return api;
    }
);