package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Vertex;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.common_utils.CommonUtils.encodeURL;
import static org.triple_brain.module.model.json.StatementJSONFields.*;

/**
 * Copyright Mozilla Public License 1.1
 */

public class VertexResourceTest extends GraphManipulationRestTest{

    @Test
    public void can_add_a_vertex() throws Exception {
        int numberOfConnectedEdges = vertexA.connectedEdges().size();
        addAVertexToVertexAUsingRest();
        int updatedNumberOfConnectedEdges = vertexA.connectedEdges().size();
        assertThat(updatedNumberOfConnectedEdges, is(numberOfConnectedEdges + 1));
    }

    @Test
    public void adding_a_vertex_returns_correct_status()throws Exception{
        ClientResponse response = addAVertexToVertexAUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    @Test
    public void adding_a_vertex_returns_the_new_edge_and_vertex_id()throws Exception{
        ClientResponse response = addAVertexToVertexAUsingRest();
        JSONObject createdStatement = response.getEntity(JSONObject.class);
        assertThat(createdStatement.getString(SUBJECT_ID), is(vertexA.id()));
        Edge newEdge = wholeGraph().edgeWithIdentifier(
                createdStatement.getString(PREDICATE_ID)
        );
        Vertex newVertex = wholeGraph().vertexWithIdentifier(
                createdStatement.getString(OBJECT_ID)
        );
        assertTrue(vertexA.hasEdge(newEdge));
        assertTrue(vertexA.hasDestinationVertex(newVertex));
    }

    private ClientResponse addAVertexToVertexAUsingRest()throws Exception{
        ClientResponse response = resource.path("vertex")
                .path(encodeURL(vertexA.id()))
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void cannot_add_a_vertex_that_user_doesnt_own()throws Exception{
        User anotherUser = createAUser();
        JenaGraphManipulator.createUserGraph(anotherUser);
        vertexManipulator = JenaVertexManipulator.withUser(anotherUser);
        Vertex anotherUserDefaultVertex = vertexManipulator.defaultVertex();
        response = resource.path("vertex").path(encodeURL(anotherUserDefaultVertex.id())).cookie(authCookie).post(ClientResponse.class);
        assertThat(response.getStatus(), is(403));
    }

    @Test
    public void can_remove_a_vertex() throws Exception {
        assertTrue(wholeGraph().containsVertex(vertexB));
        removeVertexBUsingRest();
        assertFalse(wholeGraph().containsVertex(vertexB));
    }

    @Test
    public void removing_vertex_returns_correct_response_status()throws Exception{
        ClientResponse response = removeVertexBUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse removeVertexBUsingRest()throws Exception{
        ClientResponse response = resource.path("vertex")
                .path(encodeURL(vertexB.id()))
                .cookie(authCookie)
                .delete(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void can_update_label() throws Exception {
        assertThat(vertexA.label(), is(not("new vertex label")));
        updateVertexALabelUsingRest("new vertex label");
        assertThat(vertexA.label(), is("new vertex label"));
    }

    @Test
    public void updating_label_returns_correct_status() throws Exception {
        ClientResponse response = updateVertexALabelUsingRest("new vertex label");
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse updateVertexALabelUsingRest(String label)throws Exception{
        ClientResponse response = resource
                .path("vertex/label/")
                .path(encodeURL(vertexA.id()))
                .queryParam("label", label)
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    private String personClassURI = "http://xmlns.com/foaf/0.1/Person";

    @Test
    public void can_set_type_of_vertex() throws Exception {
        assertFalse(vertexA.types().contains(personClassURI));
        setTypeOfVerteAToFoafPerson();
        assertTrue(vertexA.types().contains(personClassURI));
    }

    @Test
    public void setting_type_of_a_vertex_returns_correct_response_status() throws Exception {
        setTypeOfVerteAToFoafPerson();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse setTypeOfVerteAToFoafPerson()throws Exception{
        ClientResponse response = resource
                .path("vertex/type/")
                .path(encodeURL(vertexA.id()))
                .queryParam("type_uri", personClassURI)
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }


}
