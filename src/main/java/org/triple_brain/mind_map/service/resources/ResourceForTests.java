package org.triple_brain.mind_map.service.resources;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.SolrServerException;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Graph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.search.GraphIndexer;
import org.triple_brain.module.search.SearchUtils;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

import java.io.IOException;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/*
* Copyright Mozilla Public License 1.1
*/
@Path("/test")
public class ResourceForTests {

    @Inject
    GraphIndexer graphIndexer;

    @Inject
    SearchUtils searchUtils;

    @Path("search/create_core")
    @GET
    public Response createSessionUserSearchCore(@Context HttpServletRequest request){
        graphIndexer.createUserCore(
                userFromSession(request.getSession())
        );
        return Response.ok().build();
    }

    @Path("search/delete_all_documents")
    @GET
    public Response deleteAllUserDocuments(@Context HttpServletRequest request){
        SolrServer solrServer = searchUtils.solrServerFromUser(
                userFromSession(request.getSession())
        );
        try{
            solrServer.deleteByQuery("*:*");
            solrServer.commit();
        }catch(SolrServerException | IOException e){
            throw new RuntimeException(e);
        }
        return Response.ok().build();
    }

    @Path("search/index_all_vertices")
    @GET
    public Response indexSessionUserVertices(@Context HttpServletRequest request){
        User currentUser = userFromSession(request.getSession());
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                currentUser
        );
        Graph userGraph = graphManipulator.graphWithDefaultVertexAndDepth(10);
        for(Vertex vertex : userGraph.vertices()){
            graphIndexer.indexVertexOfUser(vertex, currentUser);
        }
        return Response.ok().build();
    }

}
