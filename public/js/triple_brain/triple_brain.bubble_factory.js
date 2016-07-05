/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer"
], function (GraphDisplayer) {
    "use strict";
    var api = {};
    api.fromHtml = function(html){
        var uiSelector;
        if(html.hasClass("vertex")){
            if(html.hasClass("suggestion")){
                uiSelector = GraphDisplayer.getVertexSuggestionSelector();
            }else if(html.hasClass("schema")){
                uiSelector = GraphDisplayer.getSchemaSelector();
            }else{
                uiSelector = GraphDisplayer.getVertexSelector();
            }
        }else if(html.hasClass("relation")){
            if(html.hasClass("suggestion")){
                uiSelector = GraphDisplayer.getRelationSuggestionSelector();
            }else if(html.hasClass("property")){
                uiSelector = GraphDisplayer.getPropertySelector();
            }else if(html.hasClass("group-relation")){
                uiSelector = GraphDisplayer.getGroupRelationSelector();
            }else{
                uiSelector = GraphDisplayer.getEdgeSelector();
            }
        }
        var uiFacade = uiSelector.withHtml(html);
        if(undefined === uiFacade){
            /*
            todo this case should not happen but it did using npm test only somehow
            should review the cache system
            also the builder *html_builder system
             */
            uiFacade = uiSelector.createFromHtmlAndUri(html, html.data("uri"));
        }
        return uiFacade;
    };
    api.fromSubHtml = function(html){
        return api.fromHtml(
            html.closest(".bubble")
        );
    };
    return api;
});