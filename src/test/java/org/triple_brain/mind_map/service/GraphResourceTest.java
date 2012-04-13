package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.Statement;
import com.sun.jersey.api.client.ClientResponse;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertex;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;

import static com.hp.hpl.jena.vocabulary.RDFS.label;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator.withDefaultUser;
import static org.triple_brain.mind_map.service.SingleUserTempClass.*;
/**
 * Copyright Mozilla Public License 1.1
 */

public class GraphResourceTest extends RestTest {

    private final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    @Before
    public void before() {
        authenticate();
        jenaGraphManipulator = withDefaultUser();
        jenaVertexManipulator = JenaVertexManipulator.withJenaGraphManipulator(jenaGraphManipulator);
        jenaEdgeManipulator = JenaEdgeManipulator.withJenaGraphManipulator(jenaGraphManipulator);
    }

    @Test
    public void can_get_graph_as_xml_rdf(){
        response = resource.path("graph").cookie(authCookie).get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
        String rdfXMLGraph = response.getEntity(String.class);
        assertThat(rdfXMLGraph, is(not(nullValue())));
    }

    @Test
    @Ignore("make tests cleaner and then make test pass")
    public void can_modify_label() throws Exception {
        Edge newEdge = jenaVertexManipulator.addVertexAndRelation(JenaVertex.withResource(
            jenaGraphManipulator.defaultUser().absoluteCentralVertex()
        ).id());
        String addedEdgeID = newEdge.id();
        String addedEdgeLabel = newEdge.label();
        assertThat(addedEdgeLabel, is(""));

        response = resource.path("graph/edge/label/").path(addedEdgeID).queryParam("label", "likes").cookie(authCookie).get(ClientResponse.class);
        Graph graph = wholeGraph();
        newEdge = graph.edgeWithIdentifier(newEdge.id());
        assertThat(newEdge.label(), is("likes"));

        Vertex newVertex = newEdge.destinationVertex();
        String addedVertexID = newVertex.id();
        assertThat(newVertex.label(), is(""));

        response = resource.path("graph/vertex/label/").path(addedVertexID).queryParam("label", "Ju-Ji-Tsu").cookie(authCookie).get(ClientResponse.class);
        graph = wholeGraph();
        newVertex = graph.vertexWithIdentifier(newVertex.id());
        assertThat(newVertex.label(), is("Ju-Ji-Tsu"));
    }

    private Graph wholeGraph(){
        return jenaGraphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
    }
}
