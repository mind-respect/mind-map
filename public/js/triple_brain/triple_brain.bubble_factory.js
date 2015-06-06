/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer"
], function (GraphDisplayer) {
    "use strict";
    var api = {};
    api.fromHtml = function(html){
        var uiFacade;
        if(html.hasClass("vertex")){
            if(html.hasClass("suggestion")){
                uiFacade = GraphDisplayer.getVertexSuggestionSelector();
            }else if(html.hasClass("schema")){
                uiFacade = GraphDisplayer.getSchemaSelector();
            }else{
                uiFacade = GraphDisplayer.getVertexSelector();
            }
        }else if(html.hasClass("relation")){
            if(html.hasClass("suggestion")){
                uiFacade = GraphDisplayer.getRelationSuggestionSelector();
            }else if(html.hasClass("property")){
                uiFacade = GraphDisplayer.getPropertySelector();
            }else if(html.hasClass("group-relation")){
                uiFacade = GraphDisplayer.getGroupRelationSelector();
            }else{
                uiFacade = GraphDisplayer.getEdgeSelector();
            }
        }
        return uiFacade.withHtml(html);
    };
    api.fromSubHtml = function(html){
        return api.fromHtml(
            html.closest(".bubble")
        );
    };
    return api;
});