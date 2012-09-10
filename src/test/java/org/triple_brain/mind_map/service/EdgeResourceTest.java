package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.junit.Test;
import org.triple_brain.module.model.graph.Edge;

import static junit.framework.Assert.assertTrue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertFalse;
import static org.triple_brain.module.common_utils.Uris.encodeURL;

/**
 * Copyright Mozilla Public License 1.1
 */
public class EdgeResourceTest extends GraphManipulationRestTest{

    @Test
    public void can_add_a_relation() throws Exception {
        assertFalse(vertexA.hasDestinationVertex(vertexC));
        addRelationBetweenVertexAAndCUsingRest();
        assertTrue(vertexA.hasDestinationVertex(vertexC));
    }

    @Test
    public void adding_a_relation_returns_correct_response_status() throws Exception{
        ClientResponse response = addRelationBetweenVertexAAndCUsingRest();
        assertThat(response.getStatus(), is(201));
    }

    @Test
    public void adding_a_relation_returns_correct_headers() throws Exception{
        ClientResponse response = addRelationBetweenVertexAAndCUsingRest();
        Edge edgeBetweenAAndC = vertexA.edgeThatLinksToDestinationVertex(vertexC);
        assertThat(
                response.getHeaders().get("Location").get(0),
                is(
                        BASE_URI + "/edge/" +
                                encodeURL(vertexA.id())
                                + "/" +
                                encodeURL(vertexC.id())
                                + "/" +
                                encodeURL(edgeBetweenAAndC.id())
                ));
    }

    private ClientResponse addRelationBetweenVertexAAndCUsingRest() throws Exception{
        ClientResponse response = resource
                .path("edge")
                .path(encodeURL(vertexA.id()))
                .path(encodeURL(vertexC.id()))
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void can_remove_a_relation() throws Exception {
        Edge edgeBetweenAAndB = vertexA.edgeThatLinksToDestinationVertex(vertexB);
        removeEdgeBetweenVertexAAndBUsingRest();
        assertFalse(wholeGraph().edges().contains(edgeBetweenAAndB));
    }

    @Test
    public void removing_a_relation_returns_correct_status() throws Exception{
        ClientResponse response = removeEdgeBetweenVertexAAndBUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse removeEdgeBetweenVertexAAndBUsingRest() throws Exception{
        Edge edgeBetweenAAndB = vertexA.edgeThatLinksToDestinationVertex(vertexB);
        ClientResponse response = resource.path("edge")
                .path(encodeURL(edgeBetweenAAndB.id()))
                .cookie(authCookie)
                .delete(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void can_update_label() throws Exception {
        Edge edgeBetweenAAndB = vertexA.edgeThatLinksToDestinationVertex(vertexB);
        assertThat(edgeBetweenAAndB.label(), is(not("new edge label")));
        updateEdgeLabelBetweenAAndBUsingRest("new edge label");
        edgeBetweenAAndB = vertexA.edgeThatLinksToDestinationVertex(vertexB);
        assertThat(edgeBetweenAAndB.label(), is("new edge label"));
    }

    @Test
    public void updating_label_returns_correct_status() throws Exception {
        ClientResponse response = updateEdgeLabelBetweenAAndBUsingRest("new edge label");
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse updateEdgeLabelBetweenAAndBUsingRest(String label)throws Exception{
        Edge edgeBetweenAAndB = vertexA.edgeThatLinksToDestinationVertex(vertexB);
        ClientResponse response = resource
                .path("edge/label/")
                .path(encodeURL(edgeBetweenAAndB.id()))
                .queryParam("label", label)
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }
}
