package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Vertex;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.model.json.drawn_graph.DrawnGraphJSONFields.VERTICES;
import static org.triple_brain.module.model.json.drawn_graph.DrawnVertexJSONFields.ID;

/**
 * Copyright Mozilla Public License 1.1
 */

public class DrawnGraphResourceTest extends GraphManipulationRestTest {

    @Test
    public void can_get_drawn_graph_with_default_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        Vertex centralVertex = vertexManipulator.defaultVertex();
        assertTrue(verticesContainID(vertices, centralVertex.id()));
    }

    @Test
    public void can_get_drawn_graph_with_specified_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        Edge newEdge = vertexManipulator.addVertexAndRelation(
                vertexManipulator.defaultVertex().id()
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
        Vertex centralVertex = vertexManipulator.defaultVertex();
        Edge newEdge = vertexManipulator.addVertexAndRelation(centralVertex.id());
        String secondVertexId = newEdge.destinationVertex().id();
        newEdge = vertexManipulator.addVertexAndRelation(secondVertexId);
        String thirdVertexId = newEdge.destinationVertex().id();

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).cookie(authCookie).get(ClientResponse.class);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(2));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), thirdVertexId));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(ServiceUtils.encodeURL(secondVertexId)).cookie(authCookie).get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(ServiceUtils.encodeURL(thirdVertexId)).cookie(authCookie).get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(2));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), vertexManipulator.defaultVertex().id()));

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
