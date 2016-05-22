/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.event_bus",
    "triple_brain.mind_map_info",
    "triple_brain.id_uri",
    "triple_brain.graph_displayer",
    "triple_brain.fork_service"
], function ($, EventBus, MindMapInfo, IdUri, GraphDisplayer, ForkService) {
    "use strict";
    var api = {},
        otherUserMenu;
    EventBus.subscribe(
        '/event/ui/graph/drawing_info/updated/',
        function(){
            var shouldDisplay = !MindMapInfo.isAnonymous() &&
                MindMapInfo.isViewOnly() && MindMapInfo.isCenterBubbleUriDefinedInUrl();
            if(shouldDisplay){
                setup();
                getOtherUserMenu().removeClass("hidden");
            }
        }
    );
    function setup(){
        setUsername();
        setupCopyLink();
    }

    function setUsername(){
        var username = IdUri.usernameFromUri(
            IdUri.getGraphElementUriInUrl()
        );
        getUsernameLink().text(
            username
        ).attr(
            "href",
            "/user/" + username
        );
    }

    function setupCopyLink(){
        getCopyLink.click(function(){
            ForkService.fork(
                buildServerFormatGraphFromVisibleBubbles(),
                function(){
                    window.location = IdUri.htmlUrlForBubbleUri(
                        GraphDisplayer.get
                    );
                }
            )
        });
    }

    function getOtherUserMenu(){
        if(otherUserMenu === undefined){
            otherUserMenu = $("#other-user-menu");
        }
        return otherUserMenu;
    }
    function getUsernameLink(){
        return getOtherUserMenu().find(
            ".username"
        );
    }
    function getCopyLink(){
        return getOtherUserMenu().find(
            ".copy"
        );
    }

    function buildServerFormatGraphFromVisibleBubbles(){
        var edges = {},
            vertices = {};
        GraphDisplayer.getEdgeSelector().visitAllEdges(function(edge){
            edges[edge.getUri()] = edge.getServerFormat();
        });
        GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
            vertices[vertex.getUri()] = vertex.getServerFormat();
        });
        return {
            edges: edges,
            vertices: vertices
        };
    }
    return api;
});