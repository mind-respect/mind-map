/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define(
    [],
    function () {
        "use strict";
        var api = {
            "Vertex": "vertex",
            "Relation": "relation",
            "GroupRelation": "group_relation",
            "Schema": "schema",
            "Property": "property",
            "VertexSuggestion": "vertex_suggestion",
            "RelationSuggestion": "relation_suggestion",
            "Meta": "meta",
            "MetaRelation": "meta_relation",
            "GroupVertexUnderMeta": "group_vertex_under_meta"
        };
        api.fromString = function (type) {
            switch (type) {
                case "edge" :
                    return api.Relation;
                case "identification" :
                    return api.Meta;
                default:
                    return type;
            }
        };
        api.getVertexTypes = function(){
            return [
                api.Vertex,
                api.VertexSuggestion,
                api.Schema,
                api.Meta
            ];
        };
        api.getEdgeTypes = function(){
            return [
                api.Relation,
                api.Property,
                api.RelationSuggestion,
                api.MetaRelation
            ];
        };
        api.getAll = function(){
            return api.getVertexTypes().concat(
                api.getEdgeTypes()
            );
        };
        return api;
    }
);
