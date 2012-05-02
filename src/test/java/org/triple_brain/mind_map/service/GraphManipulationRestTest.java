package org.triple_brain.mind_map.service;

import org.junit.AfterClass;
import org.junit.Before;
import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.User;

import static org.triple_brain.graphmanipulator.jena.JenaConnection.closeConnection;

/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulationRestTest extends RestTest {

    protected final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    protected JenaGraphManipulator graphManipulator;
    protected JenaVertexManipulator vertexManipulator;
    protected JenaEdgeManipulator edgeManipulator;

    @Before
    public void before() {
        User authenticatedUser = authenticate();
        graphManipulator = JenaGraphManipulator.withUser(authenticatedUser);
        graphManipulator.graph().removeAll();
        JenaGraphManipulator.createUserGraph(authenticatedUser);
        vertexManipulator = JenaVertexManipulator.withUser(authenticatedUser);
        edgeManipulator = JenaEdgeManipulator.withUser(authenticatedUser);
    }

    @AfterClass
    public static void after()throws Exception{
        closeConnection();
    }
}
