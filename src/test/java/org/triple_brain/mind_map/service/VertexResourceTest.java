package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;
import org.triple_brain.module.graphviz_visualisation.GraphToDrawnGraphConverter;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.model.json.graph.VertexJSONFields;

import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertTrue;
import static org.triple_brain.module.model.json.StatementJSONFields.*;
import static org.triple_brain.module.model.json.graph.GraphJSONFields.EDGES;
import static org.triple_brain.module.model.json.graph.GraphJSONFields.VERTICES;

/**
 * Copyright Mozilla Public License 1.1
 */

public class VertexResourceTest extends GraphManipulationRestTest{

    @Test
    public void can_add_a_vertex() throws Exception {
        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()).convert();
        int orginalNumberOfVertice = drawnGraph.getJSONArray(VERTICES).length();
        int orginalNumberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        assertFalse(containsVertexWithLabel(drawnGraph.getJSONArray(VERTICES), ""));
        assertFalse(containsEdgeWithLabel(drawnGraph.getJSONArray(EDGES), ""));

        Vertex sourceVertex = vertexManipulator.defaultVertex();
        response = resource.path("vertex").path(ServiceUtils.encodeURL(sourceVertex.id())).cookie(authCookie).post(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        JSONObject createdStatement = response.getEntity(JSONObject.class);
        assertThat(createdStatement.getString(SUBJECT_ID), is(sourceVertex.id()));
        String createdEdgeId = createdStatement.getString(PREDICATE_ID);
        String createdVertexId = createdStatement.getString(OBJECT_ID);
        JSONObject updatedDrawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()).convert();
        assertThat(updatedDrawnGraph.getJSONArray(VERTICES).length(), is(orginalNumberOfVertice + 1));
        assertThat(updatedDrawnGraph.getJSONArray(EDGES).length(), is(orginalNumberOfEdges + 1));
        assertTrue(containsVertexWithId(updatedDrawnGraph.getJSONArray(VERTICES), createdVertexId));
        assertTrue(containsEdgeWithId(updatedDrawnGraph.getJSONArray(EDGES), createdEdgeId));
    }

    @Test
    public void can_remove_a_vertex() throws Exception {
        Edge newEdge = vertexManipulator.addVertexAndRelation(
                vertexManipulator.defaultVertex().id()
        );
        Vertex vertex = newEdge.destinationVertex();

        JSONObject drawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()
        ).convert();
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        response = resource.path("vertex").path(ServiceUtils.encodeURL(vertex.id())).cookie(authCookie).delete(ClientResponse.class);
        assertThat(response.getStatus(), is(200));

        JSONObject updatedDrawnGraph = GraphToDrawnGraphConverter.withGraph(
                wholeGraph()
        ).convert();
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges - 1));
        assertFalse(wholeGraph().containsVertex(vertex));
    }

    @Test
    public void can_modify_label() throws Exception {
        Edge edge = vertexManipulator.addVertexAndRelation(
                vertexManipulator.defaultVertex().id()
        );

        Vertex newVertex = edge.destinationVertex();
        String addedVertexID = newVertex.id();
        assertThat(newVertex.label(), is(""));

        response = resource.path("vertex/label/").path(ServiceUtils.encodeURL(addedVertexID)).queryParam("label", "Ju-Ji-Tsu").cookie(authCookie).post(ClientResponse.class);
        Graph graph = wholeGraph();
        newVertex = graph.vertexWithIdentifier(newVertex.id());
        assertThat(newVertex.label(), is("Ju-Ji-Tsu"));
    }

    @Test
    public void can_set_type_of_vertex() throws Exception {
        Vertex centerVertex = vertexManipulator.defaultVertex();
        String personClassURI = "http://xmlns.com/foaf/0.1/Person";
        assertFalse(centerVertex.types().contains(personClassURI));
        response = resource.path("vertex/type/").path(ServiceUtils.encodeURL(centerVertex.id())).queryParam("type_uri", personClassURI).cookie(authCookie).post(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        centerVertex = wholeGraph().vertexWithIdentifier(centerVertex.id());
        assertTrue(centerVertex.types().contains(personClassURI));
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

    private Graph wholeGraph(){
        return graphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
    }
}
