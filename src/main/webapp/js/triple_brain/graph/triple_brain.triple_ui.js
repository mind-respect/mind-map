/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    ],
    function () {
        var api = {};
        api.Self = function (sourceVertexUi, edgeUi, destinationVertexUi) {
            this.sourceVertex = function () {
                return sourceVertexUi;
            };
            this.edge = function () {
                return edgeUi;
            };
            this.destinationVertex = function () {
                return destinationVertexUi;
            };
        };
        return api;
    }
);