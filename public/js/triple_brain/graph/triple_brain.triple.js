/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([], function () {
    "use strict";
    var api = {};
    api.fromEdgeAndSourceAndDestinationVertex = function (edge,
                                                          source,
                                                          destination) {
        return new Triple(
            edge,
            source,
            destination

        );
    };
    function Triple(edge, source, destination) {
        this.source = source;
        this.destination = destination;
        this.edge = edge;
    }

    Triple.prototype.getSourceVertex = function () {
        return this.source;
    };
    Triple.prototype.getDestinationVertex = function () {
        return this.destination;
    };
    Triple.prototype.getEdge = function () {
        return this.edge;
    };
    return api;
});