package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertex;
import org.triple_brain.module.graphviz_visualisation.GraphToDrawnGraphConverter;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;

import java.util.Set;

import static junit.framework.Assert.assertTrue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertFalse;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.module.model.json.graph.GraphJSONFields.EDGES;

/**
 * Copyright Mozilla Public License 1.1
 */
public class EdgeResourceTest extends RestTest {

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Before
    public void before(){
        authenticate();
    }

    @Test
    public void can_add_a_relation() throws Exception {
        Vertex centralVertex = JenaVertex.withResource(
                jenaGraphManipulator.defaultUser().absoluteCentralVertex());
        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(
                centralVertex.id());

        Vertex newVertex = newEdge.destinationVertex();
        String secondVertexId = newVertex.id();
        newEdge = jenaVertexManipulator.addVertexAndRelation(secondVertexId);

        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(wholeGraph()).convert();
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();

        Graph graph = wholeGraph();
        centralVertex = graph.vertexWithIdentifier(centralVertex.id());
        newEdge = graph.edgeWithIdentifier(newEdge.id());
        Vertex thirdVertex = newEdge.destinationVertex();
        assertFalse(neighborsOfVertex(thirdVertex).contains(centralVertex));
        response = resource.path("edge").path(ServiceUtils.encodeURL(thirdVertex.id())).path(ServiceUtils.encodeURL(centralVertex.id())).cookie(authCookie).post(ClientResponse.class);
        assertThat(response.getStatus(), is(201));
        graph = wholeGraph();
        thirdVertex = graph.vertexWithIdentifier(thirdVertex.id());
        centralVertex = graph.vertexWithIdentifier(centralVertex.id());
        assertTrue(neighborsOfVertex(thirdVertex).contains(centralVertex));
        Edge edgeBetweenThirdVertexAndCentralVertex = thirdVertex.edgeThatLinksToDestinationVertex(centralVertex);
        assertThat(response.getHeaders().get("Location").get(0),
                is(BASE_URI + "/edge/" + ServiceUtils.encodeURL(thirdVertex.id()) + "/" + ServiceUtils.encodeURL(centralVertex.id()) + "/" + ServiceUtils.encodeURL(edgeBetweenThirdVertexAndCentralVertex.id())));

        JSONObject updatedDrawnGraph = GraphToDrawnGraphConverter.withGraph(wholeGraph()).convert();
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges + 1));
    }

    @Test
    public void can_remove_a_relation() throws Exception {
        Vertex centralVertex = JenaVertex.withResource(
                jenaGraphManipulator.defaultUser().absoluteCentralVertex());
        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(
                centralVertex.id()
        );

        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()).convert();
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        response = resource.path("edge").path(ServiceUtils.encodeURL(newEdge.id())).cookie(authCookie).delete(ClientResponse.class);
        assertThat(response.getStatus(), is(200));

        JSONObject updatedDrawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()).convert();
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges - 1));
        assertFalse(wholeGraph().edges().contains(newEdge));

    }

    @Test
    public void can_update_label() throws Exception {
        Vertex centralVertex = JenaVertex.withResource(
                jenaGraphManipulator.defaultUser().absoluteCentralVertex());

        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(
                centralVertex.id());

        assertThat(newEdge.label(), is(""));

        response = resource.path("edge/label/").path(ServiceUtils.encodeURL(newEdge.id())).queryParam("label", "likes").cookie(authCookie).post(ClientResponse.class);
        Graph graph = wholeGraph();
        newEdge = graph.edgeWithIdentifier(newEdge.id());
        assertThat(newEdge.label(), is("likes"));
    }

    private Graph wholeGraph(){
        return jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
    }

    private Set<Vertex> neighborsOfVertex(Vertex vertex){
        return jenaGraphManipulator.graphWithDepthAndCenterVertexId(
                1, vertex.id()).vertices();
    }

}
