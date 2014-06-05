/**
 * Copyright Mozilla Public License 1.1
 */
define([
    "require",
    "jquery",
    "./triple_brain.template.vertices_list.js",
    "./triple_brain.module.vertices_list_element.js"
],
    function(require, $, Template, VerticesListElement) {
        "use strict";
        return {
            withVertexAndCentralVertex : function(vertex, centralVertex){
                return new VerticesListElementCreator(vertex, centralVertex);
            }
        };

        function VerticesListElementCreator(vertex, centralVertex){
            var BubbleDistanceCalculator = require("triple_brain.bubble_distance_calculator");
            var VerticesList = require("./triple_brain.module.vertices_list");
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
                verticesListElement.setLabel(vertex.text());
                html.click(function(){
                    var verticesListElement = VerticesListElement.withHtml(this);
                    var vertex = verticesListElement.associatedVertex();
                    vertex.focus();
                    vertex.scrollTo();
                });
                return verticesListElement;
            }
        }
    }
);
