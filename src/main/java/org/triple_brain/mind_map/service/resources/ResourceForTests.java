package org.triple_brain.mind_map.service.resources;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.graphmanipulator.jena.graph.JenaVertexManipulator;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.repository.user.UserRepository;
import org.triple_brain.module.search.GraphIndexer;
import org.triple_brain.module.search.SearchUtils;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;
import java.io.IOException;
import java.net.URI;

import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATED_USER_KEY;
import static org.triple_brain.mind_map.service.SecurityInterceptor.AUTHENTICATION_ATTRIBUTE_KEY;
import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("/test")
@PermitAll
public class ResourceForTests {

    @Inject
    UserRepository userRepository;

    @Inject
    GraphIndexer graphIndexer;

    @Inject
    SearchUtils searchUtils;

    @Path("login")
    @GET
    public Response createUserAuthenticateAndRedirectToHomePage(@Context HttpServletRequest request) throws Exception {
        User user = User.withUsernameAndEmail("test_user", "test@triple_brain.org")
                .password("password");
        userRepository.save(
                user
        );
        JenaGraphManipulator.createUserGraph(user);
        graphIndexer.createUserCore(user);
        deleteAllUserDocumentsForSearch(user);
        JenaVertexManipulator vertexManipulator = JenaVertexManipulator.withUser(
                user
        );
        graphIndexer.indexVertexOfUser(
                vertexManipulator.defaultVertex(),
                user
        );
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

    @Path("search/delete_all_documents")
    @GET
    public Response deleteAllUserDocuments(@Context HttpServletRequest request) {
        deleteAllUserDocumentsForSearch(
                userFromSession(request.getSession())
        );
        return Response.ok().build();
    }

    private void deleteAllUserDocumentsForSearch(User user){
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
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                currentUser
        );
        Graph userGraph = graphManipulator.graphWithDefaultVertexAndDepth(10);
        for (Vertex vertex : userGraph.vertices()) {
            graphIndexer.indexVertexOfUser(vertex, currentUser);
        }
        return Response.ok().build();
    }

}
