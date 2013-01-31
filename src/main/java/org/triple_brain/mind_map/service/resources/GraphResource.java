package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.GraphElementIdentifier;
import org.triple_brain.module.model.graph.GraphFactory;
import org.triple_brain.module.model.graph.SubGraph;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.model.json.graph.GraphJSONFields;
import org.triple_brain.module.repository.user.UserRepository;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;

import static org.triple_brain.mind_map.service.ServiceUtils.usernameInURI;
import static org.triple_brain.module.common_utils.Uris.decodeURL;

/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/graph")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class GraphResource {

    @Inject
    UserRepository userRepository;

    @Inject
    GraphFactory graphFactory;

    @GET
    @Path("{graph_uri}")
    @Produces(MediaType.APPLICATION_XML)
    public Response rdfXML(@GraphElementIdentifier @PathParam("graph_uri") String graphUri){
        User user = userRepository.findByUsername(usernameInURI(URI.create(graphUri)));
        UserGraph userGraph = graphFactory.loadForUser(
                user
        );
        return Response.ok(userGraph.toRdfXml()).build();
    }

    @GET
    @Path("/{graph_uri}/{depthOfSubVertices}")
    public Response drawnGraph(@GraphElementIdentifier @PathParam("graph_uri") String graphUri, @PathParam("depthOfSubVertices") Integer depthOfSubVertices, @Context HttpServletRequest request) throws JSONException {
        UserGraph userGraph = graphFactory.loadForUser(
                userFromGraphURI(URI.create(graphUri))
        );
        SubGraph graph = userGraph.graphWithDefaultVertexAndDepth(depthOfSubVertices);
        return Response.ok(
                GraphJSONFields.toJson(graph),
                MediaType.APPLICATION_JSON
        ).build();
    }

    @GET
    @Path("/{graph_uri}/{depthOfSubVertices}/{centralVertexId}")
    public Response drawnGraph(@GraphElementIdentifier @PathParam("graph_uri") String graphUri, @PathParam("depthOfSubVertices") Integer depthOfSubVertices, @GraphElementIdentifier @PathParam("centralVertexId") String centralVertexId, @Context HttpServletRequest request) throws JSONException{
        try{
            centralVertexId = decodeURL(centralVertexId);
        }catch(UnsupportedEncodingException e){
            Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromGraphURI(URI.create(graphUri))
        );
        SubGraph graph = userGraph.graphWithDepthAndCenterVertexId(depthOfSubVertices, centralVertexId);
        return Response.ok(
                GraphJSONFields.toJson(graph),
                MediaType.APPLICATION_JSON
        ).build();
    }

    private User userFromGraphURI(URI graphURI){
        return userRepository.findByUsername(usernameInURI(URI.create(graphURI.toString())));
    }
}
