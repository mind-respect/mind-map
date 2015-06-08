/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "require",
    "jquery",
    "triple_brain.graph_displayer",
    "triple_brain.template.vertices_list",
    "triple_brain.module.vertices_list_element"
],
    function(require, $, GraphDisplayer, Template, VerticesListElement) {
        "use strict";
        return {
            withVertexAndCentralVertex : function(vertex, centralVertex){
                return new VerticesListElementCreator(vertex, centralVertex);
            }
        };

        function VerticesListElementCreator(vertex, centralVertex){
            var BubbleDistanceCalculator = require("triple_brain.bubble_distance_calculator");
            var VerticesList = require("triple_brain.module.vertices_list");
            var html = $(Template['list_element'].merge());
            var verticesListElement = VerticesListElement.withHtml(html);
            this.create = function(){
                VerticesList.get().addHtml(html);
                html.data('vertexId', vertex.getId());
                html.data("vertexUri", vertex.getUri());
                verticesListElement.setDistanceFromCentralVertex(
                    BubbleDistanceCalculator.numberOfEdgesBetween(
                        vertex,
                        centralVertex
                    )
                );
                var text = vertex.text();
                if("" === text){
                    text = GraphDisplayer.getVertexSelector().getWhenEmptyLabel();
                }
                verticesListElement.setLabel(text);
                html.click(function(){
                    var verticesListElement = VerticesListElement.withHtml(this);
                    var vertex = verticesListElement.associatedVertex();
                    vertex.focus();
                    vertex.scrollTo();
                });
                return verticesListElement;
            };
        }
    }
);
