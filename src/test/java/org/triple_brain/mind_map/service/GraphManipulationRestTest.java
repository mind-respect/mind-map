package org.triple_brain.mind_map.service;

import com.sun.jersey.api.client.ClientResponse;
import graph.mock.JenaUserGraphMock;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.triple_brain.graphmanipulator.jena.JenaConnection;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.SubGraph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.model.graph.scenarios.VerticesCalledABAndC;
import org.triple_brain.module.search.GraphIndexer;

import javax.inject.Inject;

import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

/*
* Copyright Mozilla Public License 1.1
*/
public class GraphManipulationRestTest extends RestTest {

    protected final Integer DEPTH_OF_SUB_VERTICES_COVERING_ALL_GRAPH_VERTICES = 10;

    protected JenaUserGraphMock graphManipulator;

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
        graphManipulator = JenaUserGraphMock.mockWithUser(authenticatedUser);
        VerticesCalledABAndC vertexABAndC = makeGraphHave3SerialVerticesWithLongLabels(authenticatedUser);

        vertexA = vertexABAndC.vertexA();
        vertexB = vertexABAndC.vertexB();
        vertexC = vertexABAndC.vertexC();
    }

    @AfterClass
    public static void afterClass()throws Exception{
        JenaConnection.closeConnection();
    }

    @After
    public void after(){

    }

    protected VerticesCalledABAndC makeGraphHave3SerialVerticesWithLongLabels(User user) throws Exception {
        return testScenarios.makeGraphHave3SerialVerticesWithLongLabels(
                graphMaker.createForUser(user)
        );
    }

    protected void actualizeVertexABAndC(){
        SubGraph graph = wholeGraph();
        vertexA = graph.vertexWithIdentifier(vertexA.id());
        vertexB = graph.vertexWithIdentifier(vertexB.id());
        vertexC = graph.vertexWithIdentifier(vertexC.id());
    }

    protected SubGraph wholeGraph(){
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
