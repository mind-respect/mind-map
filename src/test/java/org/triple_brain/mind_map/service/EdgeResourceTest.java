package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.SimpleSelector;
import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONObject;
import org.junit.Test;

import java.util.List;

import static com.hp.hpl.jena.vocabulary.RDFS.label;
import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.model.json.graph.GraphJSONFields.EDGES;
import static org.triple_brain.module.graphviz_visualisation.JenaGraphToDrawnGraphConverter.graphVizDrawing;

/**
 * @author Vincent Blouin
 */
public class EdgeResourceTest extends  RestTest{

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Test
    public void can_add_a_relation() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        String secondVertexId = statement.getObject().asResource().getLocalName();
        statement = jenaVertexManipulator.addVertexAndRelation(secondVertexId);
        String thirdVertexId = statement.getObject().asResource().getLocalName();

        JSONObject drawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();

        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource rogerLamotheAsResource = jenaGraph.getResource(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getURI());
        List<Statement> statementsWithThirdVertexAsSubjectAndRogerLamotheAsObject = jenaGraph.listStatements(new SimpleSelector(statement.getObject().asResource(), null, rogerLamotheAsResource)).toList();
        assertThat(statementsWithThirdVertexAsSubjectAndRogerLamotheAsObject.size(), is(0));

        response = resource.path("edge").path(thirdVertexId).path(rogerLamotheAsResource.getLocalName()).post(ClientResponse.class);
        assertThat(response.getStatus(), is(201));
        jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        rogerLamotheAsResource = jenaGraph.getResource(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getURI());
        statementsWithThirdVertexAsSubjectAndRogerLamotheAsObject = jenaGraph.listStatements(new SimpleSelector(statement.getObject().asResource(), null, rogerLamotheAsResource)).toList();
        assertThat(statementsWithThirdVertexAsSubjectAndRogerLamotheAsObject.size(), is(1));

        String lastAddedEdgeId = statementsWithThirdVertexAsSubjectAndRogerLamotheAsObject.get(0).getPredicate().getLocalName();
        assertThat(response.getHeaders().get("Location").get(0), is(BASE_URL + "/edge/" + thirdVertexId + "/" + rogerLamotheAsResource.getLocalName() + "/" + lastAddedEdgeId));

        JSONObject updatedDrawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges + 1));
    }

    @Test
    public void can_remove_a_relation() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());
        com.hp.hpl.jena.rdf.model.Resource edge = statement.getPredicate();

        JSONObject drawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer numberOfEdges = drawnGraph.getJSONArray(EDGES).length();
        response = resource.path("edge").path(edge.getLocalName()).delete(ClientResponse.class);
        assertThat(response.getStatus(), is(200));

        JSONObject updatedDrawnGraph = graphVizDrawing(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES));
        Integer updatedNumberOfEdges = updatedDrawnGraph.getJSONArray(EDGES).length();
        assertThat(updatedNumberOfEdges, is(numberOfEdges - 1));
        assertFalse(jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES).containsResource(edge));

    }

    @Test
    public void can_update_label() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());

        String addedEdgeID = statement.getPredicate().getLocalName();
        String addedEdgeLabel = statement.getPredicate().asResource().getProperty(label).getString();
        assertThat(addedEdgeLabel, is(""));

        response = resource.path("edge/label/").path(addedEdgeID).queryParam("label", "likes").post(ClientResponse.class);
        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource edgeAsResource = jenaGraph.getResource(statement.getPredicate().getURI());
        String updatedEdgeLabel = edgeAsResource.getProperty(label).getString();
        assertThat(updatedEdgeLabel, is("likes"));
    }
}
