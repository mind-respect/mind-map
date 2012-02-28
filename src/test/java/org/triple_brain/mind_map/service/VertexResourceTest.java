package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.triple_brain.module.model.json.graph.VertexJSONFields;

import static com.hp.hpl.jena.vocabulary.RDFS.label;
import static com.thoughtworks.selenium.SeleneseTestBase.assertTrue;
import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator.jenaEdgeManipulatorWithJenaGraphManipulator;
import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.jenaGraphManipulatorWithDefaultUser;
import static org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator.jenaVertexManipulatorWithJenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaEdgeManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.module.model.json.StatementJSONFields.OBJECT_ID;
import static org.triple_brain.module.model.json.StatementJSONFields.PREDICATE_ID;
import static org.triple_brain.module.model.json.StatementJSONFields.SUBJECT_ID;
import static org.triple_brain.module.model.json.graph.GraphJSONFields.EDGES;
import static org.triple_brain.module.model.json.graph.GraphJSONFields.VERTICES;
import static org.triple_brain.module.graphviz_visualisation.JenaGraphToDrawnGraphConverter.graphVizDrawing;
import static com.hp.hpl.jena.vocabulary.RDF.*;

/**
 * @author Vincent Blouin
 */

public class VertexResourceTest extends RestTest{

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Before
    public void before() {
        jenaGraphManipulator = jenaGraphManipulatorWithDefaultUser();
        jenaVertexManipulator = jenaVertexManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = jenaEdgeManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
    }

    @Test
    public void can_add_a_vertex() throws Exception {
        JSONObject drawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        int orginalNumberOfVertice = drawnGraph.getJSONArray(VERTICES).length();
        int orginalNumberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        assertFalse(containsVertexWithLabel(drawnGraph.getJSONArray(VERTICES), ""));
        assertFalse(containsEdgeWithLabel(drawnGraph.getJSONArray(EDGES), ""));

        String sourceVertexId = jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName();
        response = resource.path("vertex").path(sourceVertexId).post(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject createdStatement = response.getEntity(JSONObject.class);
        assertThat(createdStatement.getString(SUBJECT_ID), is(sourceVertexId));
        String createdEdgeId = createdStatement.getString(PREDICATE_ID);
        String createdVertexId = createdStatement.getString(OBJECT_ID);
        JSONObject updatedDrawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        assertThat(updatedDrawnGraph.getJSONArray(VERTICES).length(), is(orginalNumberOfVertice + 1));
        assertThat(updatedDrawnGraph.getJSONArray(EDGES).length(), is(orginalNumberOfEdges + 1));
        assertTrue(containsVertexWithId(updatedDrawnGraph.getJSONArray(VERTICES), createdVertexId));
        assertTrue(containsEdgeWithId(updatedDrawnGraph.getJSONArray(EDGES), createdEdgeId));
    }

    @Test
    public void can_remove_a_vertex() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        RDFNode vertex = statement.getObject();

        JSONObject drawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        response = resource.path("vertex").path(vertex.asResource().getLocalName()).delete(ClientResponse.class);
        assertThat(response.getStatus(), is(200));

        JSONObject updatedDrawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges - 1));
        assertFalse(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES).containsResource(vertex));
    }

    @Test
    public void can_modify_label() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        String addedVertexID = statement.getObject().asResource().getLocalName();
        String addedVertexLabel = statement.getObject().asResource().getProperty(label).getString();
        assertThat(addedVertexLabel, is(""));

        response = resource.path("vertex/label/").path(addedVertexID).queryParam("label", "Ju-Ji-Tsu").post(ClientResponse.class);
        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource vertexAsResource = jenaGraph.getResource(statement.getObject().asResource().getURI());
        String updatedVertexLabel = vertexAsResource.getProperty(label).getString();
        assertThat(updatedVertexLabel, is("Ju-Ji-Tsu"));
    }

    @Test
    public void can_set_type_of_vertex() throws Exception {
        com.hp.hpl.jena.rdf.model.Resource defaultCenterVertex = jenaVertexManipulator.defaultUser().absoluteCentralVertex();
        assertFalse(defaultCenterVertex.hasProperty(type));
        String personClassURI = "http://xmlns.com/foaf/0.1/Person";
        response = resource.path("vertex/type/").path(defaultCenterVertex.getLocalName()).queryParam("type_uri", personClassURI).post(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        defaultCenterVertex = jenaVertexManipulator.defaultUser().absoluteCentralVertex();
        assertThat(defaultCenterVertex.getProperty(type).getObject().asResource().getURI(), is(personClassURI));

    }

    private boolean containsEdgeWithLabel(JSONArray edges, String label) throws Exception {
        for (int i = 0; i < edges.length(); i++) {
            if (edges.getJSONObject(i).getString(VertexJSONFields.LABEL).equals(label)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsVertexWithId(JSONArray vertices, String id) throws Exception {
        for (int i = 0; i < vertices.length(); i++) {
            if (vertices.getJSONObject(i).getString(VertexJSONFields.ID).equals(id)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsEdgeWithId(JSONArray edges, String id) throws Exception {
        for (int i = 0; i < edges.length(); i++) {
            if (edges.getJSONObject(i).getString(VertexJSONFields.ID).equals(id)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsVertexWithLabel(JSONArray vertices, String label) throws Exception {
        for (int i = 0; i < vertices.length(); i++) {
            if (vertices.getJSONObject(i).getString(VertexJSONFields.LABEL).equals(label)) {
                return true;
            }
        }
        return false;
    }
}
