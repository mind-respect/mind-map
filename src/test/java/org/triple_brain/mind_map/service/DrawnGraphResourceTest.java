package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertex;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Vertex;

import static com.thoughtworks.selenium.SeleneseTestBase.assertTrue;
import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.withDefaultUser;
import static org.triple_brain.mind_map.service.SingleUserTempClass.*;
import static org.triple_brain.module.model.json.drawn_graph.DrawnGraphJSONFields.VERTICES;
import static org.triple_brain.module.model.json.drawn_graph.DrawnVertexJSONFields.ID;

/**
 * Copyright Mozilla Public License 1.1
 */

public class DrawnGraphResourceTest extends RestTest {

    @Before
    public void before() {
        jenaGraphManipulator = withDefaultUser();
        jenaVertexManipulator = JenaVertexManipulator.withJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = JenaEdgeManipulator.withJenaGraphManipulator(jenaGraphManipulator);
        authenticate();
    }

    @Test
    public void can_get_drawn_graph_with_default_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        Vertex centralVertex = JenaVertex.withResource(
                jenaGraphManipulator.defaultUser().absoluteCentralVertex()
        );
        assertTrue(verticesContainID(vertices, centralVertex.id()));
    }

    @Test
    public void can_get_drawn_graph_with_specified_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(
                JenaVertex.withResource(
                        jenaGraphManipulator.defaultUser().absoluteCentralVertex()
                ).id()
        );
        String secondVertexId = ServiceUtils.encodeURL(newEdge.destinationVertex().id());
        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(secondVertexId).cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        secondVertexId = ServiceUtils.decodeURL(secondVertexId);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        assertTrue(verticesContainID(vertices, secondVertexId));
    }

    @Test
    public void only_a_certain_number_vertices_show_with_specified_depth() throws Exception {
        Integer depthOfSubVertices = 1;
        Vertex centralVertex = JenaVertex.withResource(
                jenaGraphManipulator.defaultUser().absoluteCentralVertex());
        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(centralVertex.id());
        String secondVertexId = newEdge.destinationVertex().id();
        newEdge = jenaVertexManipulator.addVertexAndRelation(secondVertexId);
        String thirdVertexId = newEdge.destinationVertex().id();

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).cookie(authCookie).get(ClientResponse.class);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), thirdVertexId));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(ServiceUtils.encodeURL(secondVertexId)).cookie(authCookie).get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(ServiceUtils.encodeURL(thirdVertexId)).cookie(authCookie).get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(2));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName()));

    }


    private boolean verticesContainID(JSONArray vertices, String vertexIdToTest) throws Exception {
        for (int i = 0; i < vertices.length(); i++) {
            if (vertices.getJSONObject(i).getString(ID).equals(vertexIdToTest)) {
                return true;
            }
        }
        return false;
    }


}
