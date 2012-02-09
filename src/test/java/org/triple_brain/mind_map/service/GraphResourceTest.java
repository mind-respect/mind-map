package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.SimpleSelector;
import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONObject;
import org.json.XML;
import org.junit.Before;
import org.junit.Test;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.model.json.graph.VertexJSONFields;

import java.util.List;

import static com.hp.hpl.jena.vocabulary.RDFS.label;
import static com.thoughtworks.selenium.SeleneseTestBase.assertTrue;
import static junit.framework.Assert.assertFalse;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaEdgeManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.model.json.graph.GraphJSONFields.EDGES;
import static org.triple_brain.model.json.graph.GraphJSONFields.VERTICES;
import static org.triple_brain.module.graphviz_visualisation.JenaGraphToDrawnGraphConverter.graphVizDrawing;
import static org.triple_brain.model.json.StatementJSONFields.*;

import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator.*;
/**
 * @author Vincent Blouin
 */
public class GraphResourceTest extends RestTest {

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Before
    public void before() {
        jenaGraphManipulator = jenaGraphManipulatorWithDefaultUser();
        jenaVertexManipulator = jenaVertexManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = jenaEdgeManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
    }

    @Test
    public void can_get_graph_as_xml_rdf(){
        response = resource.path("graph").get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        String rdfXMLGraph = response.getEntity(String.class);
        assertThat(rdfXMLGraph, is(not(nullValue())));
    }

    @Test
    public void can_modify_label() throws Exception {
        Statement statement = jenaVertexManipulator.addVertexAndRelation(jenaGraphManipulator.defaultUser().absoluteCentralVertex().getLocalName());

        String addedEdgeID = statement.getPredicate().getLocalName();
        String addedEdgeLabel = statement.getPredicate().asResource().getProperty(label).getString();
        assertThat(addedEdgeLabel, is(""));

        response = resource.path("graph/edge/label/").path(addedEdgeID).queryParam("label", "likes").get(ClientResponse.class);
        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource edgeAsResource = jenaGraph.getResource(statement.getPredicate().getURI());
        String updatedEdgeLabel = edgeAsResource.getProperty(label).getString();
        assertThat(updatedEdgeLabel, is("likes"));

        String addedVertexID = statement.getObject().asResource().getLocalName();
        String addedVertexLabel = statement.getObject().asResource().getProperty(label).getString();
        assertThat(addedVertexLabel, is(""));

        response = resource.path("graph/vertex/label/").path(addedVertexID).queryParam("label", "Ju-Ji-Tsu").get(ClientResponse.class);
        jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource vertexAsResource = jenaGraph.getResource(statement.getObject().asResource().getURI());
        String updatedVertexLabel = vertexAsResource.getProperty(label).getString();
        assertThat(updatedVertexLabel, is("Ju-Ji-Tsu"));
    }
}
