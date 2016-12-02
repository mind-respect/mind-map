/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    ],
    function () {
        "use strict";
        var api = {};
        api.TripleUi = function (edgeUi, sourceVertexUi, destinationVertexUi) {
            this.edge = function () {
                return edgeUi;
            };
            this.sourceVertex = function () {
                return sourceVertexUi;
            };
            this.destinationVertex = function () {
                return destinationVertexUi;
            };
        };
        return api;
    }
);