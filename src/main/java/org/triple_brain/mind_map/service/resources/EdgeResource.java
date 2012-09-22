package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.graph.*;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.common_utils.Uris.decodeURL;
import static org.triple_brain.module.common_utils.Uris.encodeURL;


/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/edge")
@Produces(MediaType.APPLICATION_JSON)
public class EdgeResource {

    @Inject
    GraphFactory graphFactory;

    @POST
    @Path("/{sourceVertexId}/{destinationVertexId}")
    public Response addRelation(@GraphElementIdentifier @PathParam("sourceVertexId") String sourceVertexId, @GraphElementIdentifier @PathParam("destinationVertexId") String destinationVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException, UnsupportedEncodingException {
        try{
            sourceVertexId = decodeURL(sourceVertexId);
            destinationVertexId = decodeURL(destinationVertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex sourceVertex = userGraph.vertexWithURI(Uris.get(
                sourceVertexId
        ));
        Vertex destinationVertex = userGraph.vertexWithURI(Uris.get(
                destinationVertexId
        ));
        Edge createdEdge = sourceVertex.addRelationToVertex(destinationVertex);
        return Response.created(new URI(request.getRequestURL() + "/" + encodeURL(createdEdge.id()))).build();
    }

    @DELETE
    @Path("/{edgeId}")
    public Response removeRelation(@GraphElementIdentifier @PathParam("edgeId") String edgeId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            edgeId = decodeURL(edgeId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph= graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Edge edge = userGraph.edgeWithUri(Uris.get(
                edgeId
        ));
        edge.remove();
        return Response.ok().build();
    }

    @POST
    @Path("/label/{edgeId}")
    public Response modifyEdgeLabel(@GraphElementIdentifier @PathParam("edgeId") String edgeId, @QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            edgeId = decodeURL(edgeId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Edge edge = userGraph.edgeWithUri(Uris.get(
                edgeId
        ));
        edge.label(label);
        return Response.ok().build();
    }
}
