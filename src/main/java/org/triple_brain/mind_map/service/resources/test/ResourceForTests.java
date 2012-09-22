package org.triple_brain.mind_map.service.resources.test;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.codehaus.jettison.json.JSONArray;
import org.triple_brain.graphmanipulator.jena.graph.JenaUserGraph;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.*;
import org.triple_brain.module.model.graph.scenarios.TestScenarios;
import org.triple_brain.module.model.graph.scenarios.VerticesCalledABAndC;
import org.triple_brain.module.model.json.UserJSONFields;
import org.triple_brain.module.model.json.graph.VertexJsonFields;
import org.triple_brain.module.repository.user.UserRepository;
import org.triple_brain.module.search.GraphIndexer;
import org.triple_brain.module.search.SearchUtils;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URI;
import java.util.UUID;

import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATED_USER_KEY;
import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATION_ATTRIBUTE_KEY;
import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("/test")
@Produces(MediaType.APPLICATION_JSON)
@PermitAll
@Singleton
public class ResourceForTests {

    @Inject
    UserRepository userRepository;

    @Inject
    GraphIndexer graphIndexer;

    @Inject
    SearchUtils searchUtils;

    @Inject
    private GraphFactory graphFactory;

    @Inject
    TestScenarios testScenarios;

    @Inject
    GraphComponentTest graphComponentTest;

    @Path("login")
    @GET
    public Response createUserAuthenticateAndRedirectToHomePage(@Context HttpServletRequest request) throws Exception {
        User user = User.withUsernameAndEmail("test_user", "test@triple_brain.org")
                .password("password");
        userRepository.save(
                user
        );
        graphFactory.createForUser(user);
        graphIndexer.createUserCore(user);
        deleteAllUserDocumentsForSearch(user);
        JenaUserGraph graphManipulator = JenaUserGraph.withUser(
                user
        );
        graphIndexer.indexVertexOfUser(
                graphManipulator.defaultVertex(),
                user
        );
        Vertex destinationVertex = graphManipulator.defaultVertex();
        for (int i = 0; i < 100; i++) {
            Edge edge = destinationVertex.addVertexAndRelation();
            destinationVertex = edge.destinationVertex();
        }
        request.getSession().setAttribute(AUTHENTICATION_ATTRIBUTE_KEY, true);
        request.getSession().setAttribute(AUTHENTICATED_USER_KEY, user);
        return Response.temporaryRedirect(
                new URI(
                        request.getScheme() + "://"
                                + request.getLocalAddr()
                                + ":" + request.getServerPort()
                                + "/"
                )
        ).build();

    }

    @Path("search/create_core")
    @GET
    public Response createSessionUserSearchCore(@Context HttpServletRequest request) {
        graphIndexer.createUserCore(
                userFromSession(request.getSession())
        );
        return Response.ok().build();
    }

    @Path("search/close")
    @GET
    public Response closeSearchEngine() {
        graphIndexer.close();
        return Response.ok().build();
    }

    @Path("search/delete_all_documents")
    @GET
    public Response deleteAllUserDocuments(@Context HttpServletRequest request) {
        deleteAllUserDocumentsForSearch(
                userFromSession(request.getSession())
        );
        return Response.ok().build();
    }

    private void deleteAllUserDocumentsForSearch(User user) {
        SolrServer solrServer = searchUtils.solrServerFromUser(
                user
        );
        try {
            solrServer.deleteByQuery("*:*");
            solrServer.commit();
        } catch (SolrServerException | IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Path("search/index_all_vertices")
    @GET
    public Response indexSessionUserVertices(@Context HttpServletRequest request) {
        User currentUser = userFromSession(request.getSession());
        JenaUserGraph graphManipulator = JenaUserGraph.withUser(
                currentUser
        );
        SubGraph userGraph = graphManipulator.graphWithDefaultVertexAndDepth(10);
        for (Vertex vertex : userGraph.vertices()) {
            graphIndexer.indexVertexOfUser(vertex, currentUser);
        }
        return Response.ok().build();
    }

    @Path("create_user")
    @POST
    public Response createUserWithDefaultPassword() throws Exception {
        User user = User.withUsernameAndEmail(
                UUID.randomUUID().toString(),
                UUID.randomUUID().toString() + "@triplebrain.org")
                .password("password");
        userRepository.save(user);
        return Response.ok(
                UserJSONFields.toJSON(user)
        ).build();
    }


    @Path("make_graph_have_3_serial_vertices_with_long_labels")
    @GET
    public Response makeGraphHave3SerialVerticesWithLongLabels(@Context HttpServletRequest request) throws Exception {
        User currentUser = userFromSession(request.getSession());
        graphComponentTest.user(currentUser);
        VerticesCalledABAndC verticesCalledABAndC = testScenarios.makeGraphHave3SerialVerticesWithLongLabels(
                graphFactory.loadForUser(currentUser)
        );
        JSONArray verticesCalledABAndCAsJsonArray = new JSONArray();
        verticesCalledABAndCAsJsonArray
                .put(
                        VertexJsonFields.toJson(
                                verticesCalledABAndC.vertexA()
                        )
                )
                .put(
                        VertexJsonFields.toJson(
                                verticesCalledABAndC.vertexB()
                        ))
                .put(
                        VertexJsonFields.toJson(
                                verticesCalledABAndC.vertexC()
                        ));

        return Response.ok(verticesCalledABAndCAsJsonArray).build();
    }





}
