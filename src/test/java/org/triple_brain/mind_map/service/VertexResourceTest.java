package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.model.FriendlyResource;
import org.triple_brain.module.model.Suggestion;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.GraphMaker;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.model.json.ExternalResourceJsonFields;
import org.triple_brain.module.model.json.SuggestionJsonFields;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;
import org.triple_brain.module.model.json.graph.VertexJsonFields;

import javax.inject.Inject;
import java.net.URI;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.common_utils.Uris.encodeURL;
import static org.triple_brain.module.model.json.StatementJsonFields.*;

/**
 * Copyright Mozilla Public License 1.1
 */

public class VertexResourceTest extends GraphManipulationRestTest {

    @Inject
    private GraphMaker graphMaker;

    protected UserGraph userGraph;

    @Test
    public void can_add_a_vertex() throws Exception {
        int numberOfConnectedEdges = vertexA.connectedEdges().size();
        addAVertexToVertexAUsingRest();
        int updatedNumberOfConnectedEdges = vertexA.connectedEdges().size();
        assertThat(updatedNumberOfConnectedEdges, is(numberOfConnectedEdges + 1));
    }

    @Test
    public void adding_a_vertex_returns_correct_status() throws Exception {
        ClientResponse response = addAVertexToVertexAUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    @Test
    public void adding_a_vertex_returns_the_new_edge_and_vertex_id() throws Exception {
        ClientResponse response = addAVertexToVertexAUsingRest();
        JSONObject createdStatement = response.getEntity(JSONObject.class);
        JSONObject subject = createdStatement.getJSONObject(SOURCE_VERTEX);
        assertThat(subject.getString(VertexJsonFields.ID), is(vertexA.id()));
        Edge newEdge = wholeGraph().edgeWithIdentifier(
                createdStatement.getJSONObject(EDGE).getString(EdgeJsonFields.ID)
        );
        Vertex newVertex = wholeGraph().vertexWithIdentifier(
                createdStatement.getJSONObject(END_VERTEX).getString(VertexJsonFields.ID)
        );
        assertTrue(vertexA.hasEdge(newEdge));
        assertTrue(vertexA.hasDestinationVertex(newVertex));
    }

    private ClientResponse addAVertexToVertexAUsingRest() throws Exception {
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexA.id()))
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void cannot_add_a_vertex_that_user_doesnt_own() throws Exception {
        User anotherUser = createAUser();
        graphMaker.createForUser(anotherUser);
        userGraph = graphMaker.createForUser(anotherUser);
        Vertex anotherUserDefaultVertex = userGraph.defaultVertex();
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
    public void removing_vertex_returns_correct_response_status() throws Exception {
        ClientResponse response = removeVertexBUsingRest();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse removeVertexBUsingRest() throws Exception {
        ClientResponse response = resource
                .path("vertex")
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

    private ClientResponse updateVertexALabelUsingRest(String label) throws Exception {
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexA.id()))
                .path("label")
                .queryParam("label", label)
                .cookie(authCookie)
                .post(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void can_add_an_additional_type_to_vertex() throws Exception {
        assertTrue(
                vertexA.getAdditionalTypes().isEmpty()
        );
        addFoafPersonTypeToVertexA();
        assertFalse(
                vertexA.getAdditionalTypes().isEmpty()
        );
    }

    @Test
    public void can_remove_the_additional_type_of_vertex() throws Exception {
        addFoafPersonTypeToVertexA();
        assertFalse(
                vertexA.getAdditionalTypes().isEmpty()
        );
        removeFoafPersonIdentificationToVertexA();
        assertTrue(
                vertexA.getAdditionalTypes().isEmpty()
        );
    }

    @Test
    public void setting_type_of_a_vertex_returns_correct_response_status() throws Exception {
        addFoafPersonTypeToVertexA();
        assertThat(response.getStatus(), is(200));
    }

    private ClientResponse addFoafPersonTypeToVertexA() throws Exception {
        JSONObject personType = ExternalResourceJsonFields.toJson(
                testScenarios.personType()
        );
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexA.id()))
                .path("type")
                .cookie(authCookie)
                .type("application/json")
                .post(ClientResponse.class, personType);
        actualizeVertexABAndC();
        return response;
    }

    private ClientResponse removeFoafPersonIdentificationToVertexA() throws Exception {
        FriendlyResource personType = testScenarios.personType();
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexA.id()))
                .path("identification")
                .path(encodeURL(personType.uri().toString()))
                .cookie(authCookie)
                .type("application/json")
                .delete(ClientResponse.class);
        actualizeVertexABAndC();
        return response;
    }

    @Test
    public void can_set_suggestions_of_vertex() throws Exception {
        assertTrue(vertexA.suggestions().isEmpty());
        Suggestion suggestion = Suggestion.withTypeDomainAndLabel(
                new URI("http://rdf.freebase.com/rdf/time/event/start_date"),
                new URI("http://rdf.freebase.com/rdf/type/datetime"),
                "Start date"
        );
        setSuggestionsOfVertex(
                new JSONArray().put(
                        SuggestionJsonFields.toJson(suggestion)
                )
        );
        assertFalse(vertexA.suggestions().isEmpty());
    }

    private ClientResponse setSuggestionsOfVertex(JSONArray suggestions) throws Exception {
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexA.id()))
                .path("suggestions")
                .cookie(authCookie)
                .type("application/json")
                .post(ClientResponse.class, suggestions);
        actualizeVertexABAndC();
        return response;
    }
}
