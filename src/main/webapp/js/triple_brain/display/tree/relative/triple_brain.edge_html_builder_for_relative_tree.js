/**
 * Copyright Mozilla Public License 1.1
 */

define([
    "require",
    "jquery",
    "triple_brain.ui.graph",
    "triple_brain.mind-map_template",
    "triple_brain.id_uri",
    "triple_brain.ui.vertex_and_edge_common",
    "triple_brain.tree_edge",
    "triple_brain.edge",
    "triple_brain.ui.arrow_line",
    "triple_brain.event_bus",
    "triple_brain.relative_vertex",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.vertex",
    "jquery.cursor-at-end"

],
    function(require, $, GraphUi, MindMapTemplate, IdUriUtils, VertexAndEdgeCommon, TreeEdge, EdgeService, ArrowLine, EventBus, RelativeVertex, RelativeTreeTemplates, Vertex){
        var api = {};
        api.get = function(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade){
            return new EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade);
        };
        function EdgeCreator(edgeServer, parentVertexHtmlFacade, childVertexHtmlFacade){
            var uri = edgeServer.id;
            edgeServer.id = IdUriUtils.graphElementIdFromUri(edgeServer.id);
            var html = RelativeTreeTemplates['edge'].merge(edgeServer);
            this.create = function(){
                GraphUi.addHTML(
                    html
                );
                $(html).data(
                    "source_vertex_id",
                    parentVertexHtmlFacade.getId()
                );
                $(html).data(
                    "destination_vertex_id",
                    childVertexHtmlFacade.getId()
                );
                $(html).click(function(){
                    changeToInput($(this));
                });
                createMenu();
                var relativeVertex = RelativeVertex.withVertex(
                    childVertexHtmlFacade
                );
                var textContainer = childVertexHtmlFacade.textContainer();

                var isToTheLeft = relativeVertex.isToTheLeft();
                if(isToTheLeft){
                    textContainer.append(html);
                }else{
                    textContainer.prepend(html);
                }
                childVertexHtmlFacade.adjustWidth();
                if(isToTheLeft){
                    relativeVertex.adjustPosition();
                }
                drawArrowLine();
                var edge = edgeFacade();
                edge.setUri(uri);
                edge.hideMenu();
                EventBus.publish(
                    '/event/ui/html/edge/created/',
                    edge
                );
                return edge;
            }

            function changeToInput(html){
                var previousEdge = edgeOfSubHtmlComponent(html);
                var input = RelativeTreeTemplates['edge_input'].merge({
                    label : html.text()
                });
                $(input).data(
                    "source_vertex_id",
                    previousEdge.sourceVertex().getId()
                );
                $(input).data(
                    "destination_vertex_id",
                    previousEdge.destinationVertex().getId()
                );
                if(input.val() === TreeEdge.EMPTY_LABEL){
                    $(input).val("");
                }
                input.blur(function(){
                    var html = $(this);
                    changeToSpan(html);
                });
                VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                    input
                );
                input.change(function() {
                    var html = $(this);
                    var edge = edgeOfSubHtmlComponent(html);
                    EdgeService.updateLabel(edge, edge.text());
                });
                input.keydown(function() {
                    $(this).keyup();
                });
                input.keyup(function() {
                    var html = $(this);
                    VertexAndEdgeCommon.adjustWidthToNumberOfChars(
                        html
                    );
                    var vertex = Vertex.withHtml(
                        html.closest(".vertex")
                    );
                    vertex.adjustWidth();
                });
                var uri = previousEdge.getUri();
                var arrowLine = previousEdge.arrowLine();
                $(html).replaceWith(
                    input
                );
                var edge = edgeOfSubHtmlComponent(input);
                edge.setUri(uri);
                edge.setArrowLine(arrowLine);
                input.focus();
                input.setCursorToTextEnd();
                var vertex = Vertex.withHtml(
                    input.closest(".vertex")
                );
                vertex.adjustWidth();
            }

            function changeToSpan(previousHtml){
                var previousEdge = edgeOfSubHtmlComponent(
                    previousHtml
                );
                var html = RelativeTreeTemplates['edge'].merge({
                    label: previousEdge.text()
                });
                var html = $(html);
                html.data(
                    "source_vertex_id",
                    previousEdge.sourceVertex().getId()
                );
                html.data(
                    "destination_vertex_id",
                    previousEdge.destinationVertex().getId()
                );
                html.click(function(){
                    changeToInput($(this));
                });
                var uri = previousEdge.getUri();
                var arrowLine = previousEdge.arrowLine();
                previousHtml.replaceWith(html);
                var edge = edgeOfSubHtmlComponent(html);
                edge.setUri(uri);
                edge.setArrowLine(arrowLine);
                var vertex = Vertex.withHtml(html.closest(".vertex"));
                var relativeVertex = RelativeVertex.withVertex(vertex);
                relativeVertex.adjustPositionIfApplicable();
                relativeVertex.adjustAllChildrenPositionIfApplicable();
                TreeEdge.redrawAllEdges();
            }

            function createMenu(){
                var removeButton = MindMapTemplate['edge_remove_button'].merge();
                $(html).append(removeButton);

                removeButton.click(function() {
                    var edge = edgeOfSubHtmlComponent(this);
                    EdgeService.remove(edge);
                });
            }

            function edgeOfSubHtmlComponent(htmlOfSubComponent){
                return TreeEdge.withHtml(
                    htmlOfSubComponent
                );
            }

            function drawArrowLine(){
                var edge = edgeFacade();
                edge.setArrowLine(
                    ArrowLine.ofEdgeHavingUndefinedArrowLine(
                        edge
                    )
                );
                edge.arrowLine().drawInWithDefaultStyle();
            }

            function edgeFacade(){
                return TreeEdge.withHtml(html);
            }
        }
        return api;
    }
);