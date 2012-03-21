package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Before;
import org.junit.Test;

import static com.thoughtworks.selenium.SeleneseTestBase.assertTrue;
import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator.jenaEdgeManipulatorWithJenaGraphManipulator;
import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.jenaGraphManipulatorWithDefaultUser;
import static org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator.jenaVertexManipulatorWithJenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.*;
import static org.triple_brain.module.model.json.drawn_graph.DrawnGraphJSONFields.VERTICES;
import static org.triple_brain.module.model.json.drawn_graph.DrawnVertexJSONFields.ID;

/**
 * @author Vincent Blouin
 */

public class DrawnGraphResourceTest extends RestTest {

    @Before
    public void before() {
        jenaGraphManipulator = jenaGraphManipulatorWithDefaultUser();
        jenaVertexManipulator = jenaVertexManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = jenaEdgeManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
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
        assertTrue(verticesContainID(vertices,jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName()));
    }

    @Test
    public void can_get_drawn_graph_with_specified_central_vertex() throws Exception {
        Integer depthOfSubVertices = 2;
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        String secondVertexId = statement.getObject().asResource().getLocalName();
        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(secondVertexId).cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph, is(not(nullValue())));
        JSONArray vertices = drawnGraph.getJSONArray(VERTICES);
        assertThat(vertices.length(), is(greaterThan(0)));
        assertTrue(verticesContainID(vertices, secondVertexId));
    }

    @Test
    public void only_a_certain_number_vertices_show_with_specified_depth() throws Exception {
        Integer depthOfSubVertices = 1;

        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        String secondVertexId = statement.getObject().asResource().getLocalName();
        statement = jenaVertexManipulator.addVertexAndRelation(secondVertexId);
        String thirdVertexId = statement.getObject().asResource().getLocalName();

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).cookie(authCookie).get(ClientResponse.class);
        JSONObject drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));
        assertFalse(verticesContainID(drawnGraph.getJSONArray(VERTICES), thirdVertexId));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(secondVertexId).cookie(authCookie).get(ClientResponse.class);
        drawnGraph = response.getEntity(JSONObject.class);
        assertThat(drawnGraph.getJSONArray(VERTICES).length(), is(3));

        response = resource.path("drawn_graph").path(depthOfSubVertices.toString()).path(thirdVertexId).cookie(authCookie).get(ClientResponse.class);
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
