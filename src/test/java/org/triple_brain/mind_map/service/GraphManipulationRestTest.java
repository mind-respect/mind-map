package org.triple_brain.mind_map.service;

import graph.mock.JenaGraphManipulatorMock;
import graph.scenarios.GraphScenariosGenerator;
import graph.scenarios.VertexABAndC;
import org.junit.AfterClass;
import org.junit.Before;
import org.triple_brain.graphmanipulator.jena.graph.JenaEdgeManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;

import static org.triple_brain.graphmanipulator.jena.JenaConnection.closeConnection;

/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulationRestTest extends RestTest {

    protected final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    protected JenaGraphManipulatorMock graphManipulator;
    protected JenaVertexManipulator vertexManipulator;
    protected JenaEdgeManipulator edgeManipulator;

    protected Vertex vertexA;
    protected Vertex vertexB;
    protected Vertex vertexC;

    protected User authenticatedUser;

    @Before
    public void before() throws Exception{
        authenticatedUser = authenticate();
        graphManipulator = JenaGraphManipulatorMock.mockWithUser(authenticatedUser);
        vertexManipulator = JenaVertexManipulator.withUser(authenticatedUser);
        edgeManipulator = JenaEdgeManipulator.withUser(authenticatedUser);
        makeGraphHave3VerticesABCWhereAIsDefaultCenterVertexAndAPointsToBAndBPointsToC(authenticatedUser);
    }

    @AfterClass
    public static void after()throws Exception{
        closeConnection();
    }

    protected void makeGraphHave3VerticesABCWhereAIsDefaultCenterVertexAndAPointsToBAndBPointsToC(User user) throws Exception {
        GraphScenariosGenerator graphScenariosGenerator = GraphScenariosGenerator.withUserManipulators(
                user,
                graphManipulator,
                vertexManipulator,
                edgeManipulator
        );
        VertexABAndC vertexABAndC = graphScenariosGenerator.makeGraphHave3VerticesABCWhereAIsDefaultCenterVertexAndAPointsToBAndBPointsToC();
        vertexA = vertexABAndC.vertexA();
        vertexB = vertexABAndC.vertexB();
        vertexC = vertexABAndC.vertexC();
    }

    protected void actualizeVertexABAndC(){
        Graph graph = wholeGraph();
        vertexA = graph.vertexWithIdentifier(vertexA.id());
        vertexB = graph.vertexWithIdentifier(vertexB.id());
        vertexC = graph.vertexWithIdentifier(vertexC.id());
    }

    protected Graph wholeGraph(){
        return graphManipulator.graphWithDefaultVertexAndDepth(DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES);
    }
}
