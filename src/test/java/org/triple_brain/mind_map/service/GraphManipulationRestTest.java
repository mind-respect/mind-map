package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import graph.mock.JenaGraphManipulatorMock;
import graph.scenarios.TestScenarios;
import graph.scenarios.VerticesCalledABAndC;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.search.GraphIndexer;

import javax.inject.Inject;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;
import static org.triple_brain.graphmanipulator.jena.JenaConnection.closeConnection;

/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulationRestTest extends RestTest {

    protected final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    protected JenaGraphManipulatorMock graphManipulator;

    protected Vertex vertexA;
    protected Vertex vertexB;
    protected Vertex vertexC;

    protected User authenticatedUser;

    @Inject
    GraphIndexer graphIndexer;

    @Before
    public void before() throws Exception{
        authenticatedUser = authenticate();
        createUserCore();
        deleteAllUserVerticesFromSearch();
        graphManipulator = JenaGraphManipulatorMock.mockWithUser(authenticatedUser);
        VerticesCalledABAndC vertexABAndC = makeGraphHave3SerialVerticesWithLongLabels(authenticatedUser);

        vertexA = vertexABAndC.vertexA();
        vertexB = vertexABAndC.vertexB();
        vertexC = vertexABAndC.vertexC();
    }

    @AfterClass
    public static void afterClass()throws Exception{
        closeConnection();
    }

    @After
    public void after(){
    }

    protected VerticesCalledABAndC makeGraphHave3SerialVerticesWithLongLabels(User user) throws Exception {
        TestScenarios graphScenariosGenerator = TestScenarios.withUserManipulators(
                user,
                graphManipulator
        );
        return graphScenariosGenerator.makeGraphHave3SerialVerticesWithLongLabels();
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

    private void createUserCore(){
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("create_core")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    private void deleteAllUserVerticesFromSearch(){
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("delete_all_documents")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }

    protected void indexAllVertices(){
        ClientResponse response = resource
                .path("test")
                .path("search")
                .path("index_all_vertices")
                .cookie(authCookie)
                .get(ClientResponse.class);
        assertThat(response.getStatus(), is(200));
    }
}
