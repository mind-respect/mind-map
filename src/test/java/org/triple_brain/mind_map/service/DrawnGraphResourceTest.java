package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.TripleBrainUris;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Vertex;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.common_utils.Uris.decodeURL;
import static org.triple_brain.module.common_utils.Uris.encodeURL;
import static org.triple_brain.module.model.json.drawn_graph.DrawnGraphJSONFields.VERTICES;
import static org.triple_brain.module.model.json.drawn_graph.DrawnVertexJSONFields.ID;

/**
 * Copyright Mozilla Public License 1.1
 */

public class DrawnGraphResourceTest extends GraphManipulationRestTest {

    @Test
    public void can_get_drawn_graph_around_default_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .path(depthOfSubVertices.toString())
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        Vertex centralVertex = userGraph.defaultVertex();
        assertTrue(verticesContainID(vertices, centralVertex.id()));
    }

    @Test
    public void can_get_drawn_graph_around_specified_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        Vertex defaultVertex = userGraph.defaultVertex();
        Edge newEdge = defaultVertex.addVertexAndRelation();
        String secondVertexId = encodeURL(newEdge.destinationVertex().id());
        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .path(depthOfSubVertices.toString())
                .path(secondVertexId)
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        secondVertexId = decodeURL(secondVertexId);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        assertTrue(verticesContainID(vertices, secondVertexId));
    }

    @Test
    public void only_a_certain_number_vertices_show_with_specified_depth() throws Exception {
        Integer depthOfSubVertices = 1;
        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .path(depthOfSubVertices.toString())
                .cookie(authCookie)
                .get(ClientResponse.class);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(2));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), vertexC.id()));

        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .path(depthOfSubVertices.toString())
                .path(encodeURL(vertexB.id()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));

        response = resource
                .path("drawn_graph")
                .path(encodeURL(authenticatedUser.mindMapURIFromSiteURI(TripleBrainUris.BASE)))
                .path(depthOfSubVertices.toString())
                .path(encodeURL(vertexC.id()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(2));
        Vertex defaultVertex = userGraph.defaultVertex();
        assertFalse(
                verticesContainID(
                        drawnGraph.getJSONArray(VERTICES),
                        defaultVertex.id()
                )
        );
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
