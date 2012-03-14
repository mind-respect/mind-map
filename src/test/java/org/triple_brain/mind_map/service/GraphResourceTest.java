package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.junit.Before;
import org.junit.Test;

import static com.hp.hpl.jena.vocabulary.RDFS.label;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator.jenaEdgeManipulatorWithJenaGraphManipulator;
import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.jenaGraphManipulatorWithDefaultUser;
import static org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator.jenaVertexManipulatorWithJenaGraphManipulator;
import static org.triple_brain.mind_map.service.SingleUserTempClass.*;
/**
 * @author Vincent Blouin
 */

public class GraphResourceTest extends RestTest {

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Before
    public void before() {
        authenticate();
        jenaGraphManipulator = jenaGraphManipulatorWithDefaultUser();
        jenaVertexManipulator = jenaVertexManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = jenaEdgeManipulatorWithJenaGraphManipulator(jenaGraphManipulator);
    }

    @Test
    public void can_get_graph_as_xml_rdf(){
        response = resource.path("graph").cookie(authCookie).get(ClientResponse.class);
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

        response = resource.path("graph/edge/label/").path(addedEdgeID).queryParam("label", "likes").cookie(authCookie).get(ClientResponse.class);
        Model jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource edgeAsResource = jenaGraph.getResource(statement.getPredicate().getURI());
        String updatedEdgeLabel = edgeAsResource.getProperty(label).getString();
        assertThat(updatedEdgeLabel, is("likes"));

        String addedVertexID = statement.getObject().asResource().getLocalName();
        String addedVertexLabel = statement.getObject().asResource().getProperty(label).getString();
        assertThat(addedVertexLabel, is(""));

        response = resource.path("graph/vertex/label/").path(addedVertexID).queryParam("label", "Ju-Ji-Tsu").cookie(authCookie).get(ClientResponse.class);
        jenaGraph = jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
        com.hp.hpl.jena.rdf.model.Resource vertexAsResource = jenaGraph.getResource(statement.getObject().asResource().getURI());
        String updatedVertexLabel = vertexAsResource.getProperty(label).getString();
        assertThat(updatedVertexLabel, is("Ju-Ji-Tsu"));
    }
}
