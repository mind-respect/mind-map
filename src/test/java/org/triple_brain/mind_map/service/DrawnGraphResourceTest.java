package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.mind_map.service.utils.GraphManipulationRestTest;
import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.json.StatementJsonFields;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;
import org.triple_brain.module.model.json.graph.VertexJsonFields;

import java.net.URI;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.common_utils.Uris.decodeURL;
import static org.triple_brain.module.common_utils.Uris.encodeURL;
import static org.triple_brain.module.model.json.drawn_graph.DrawnGraphJSONFields.VERTICES;

/**
 * Copyright Mozilla Public License 1.1
 */

public class DrawnGraphResourceTest extends GraphManipulationRestTest {

    @Test
    public void can_get_drawn_graph_around_default_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        ClientResponse response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapUri()))
                .path(depthOfSubVertices.toString())
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONObject vertices = drawnGraph.getJSONObject(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        JSONObject defaultVertex = vertexA();
        assertTrue(vertexUtils.vertexIsInVertices(defaultVertex, vertices));
    }

    @Test
    public void can_get_drawn_graph_around_specified_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        JSONObject defaultVertex = vertexA();
        JSONObject createdStatement = vertexUtils.addAVertexToVertexAWithUri(Uris.get(
                defaultVertex.getString(VertexJsonFields.ID)
        )).getEntity(JSONObject.class);
        JSONObject newEdge = createdStatement.getJSONObject(StatementJsonFields.EDGE);
        String secondVertexId = encodeURL(newEdge.getString(EdgeJsonFields.DESTINATION_VERTEX_ID));
        ClientResponse response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapUri()))
                .path(depthOfSubVertices.toString())
                .path(secondVertexId)
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        secondVertexId = decodeURL(secondVertexId);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONObject vertices = drawnGraph.getJSONObject(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        assertTrue(verticesContainID(vertices, secondVertexId));
    }

    @Test
    public void only_a_certain_number_vertices_show_with_specified_depth() throws Exception {
        Integer depthOfSubVertices = 1;
        ClientResponse response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapUri()))
                .path(depthOfSubVertices.toString())
                .cookie(authCookie)
                .get(ClientResponse.class);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONObject(VERTICES).length(), is(2));
        assertFalse(verticesContainID(drawnGraph.getJSONObject(VERTICES), vertexCUri().toString()));

        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapUri()))
                .path(depthOfSubVertices.toString())
                .path(encodeURL(vertexBUri().toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONObject(VERTICES).length(), is(3));

        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapUri()))
                .path(depthOfSubVertices.toString())
                .path(encodeURL(vertexCUri().toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONObject(VERTICES).length(), is(2));
        URI defaultVertexUri = vertexAUri();
        assertFalse(
                verticesContainID(
                        drawnGraph.getJSONObject(VERTICES),
                        defaultVertexUri.toString()
                )
        );
    }

    private boolean verticesContainID(JSONObject vertices, String vertexIdToTest) throws Exception {
        return vertices.has(vertexIdToTest);
    }


}
