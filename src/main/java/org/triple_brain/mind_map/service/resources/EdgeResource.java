package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.triple_brain.mind_map.service.ServiceUtils;
import org.triple_brain.module.model.graph.Edge;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaEdgeManipulator;

/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/edge")
@Produces(MediaType.APPLICATION_JSON)
public class EdgeResource {

    @POST
    @Path("/{sourceVertexId}/{destinationVertexId}")
    public Response addRelation(@PathParam("sourceVertexId") String sourceVertexId, @PathParam("destinationVertexId") String destinationVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException, UnsupportedEncodingException {
        try{
            sourceVertexId = ServiceUtils.decodeURL(sourceVertexId);
            destinationVertexId = ServiceUtils.decodeURL(destinationVertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        Edge createdEdge = jenaEdgeManipulator.addRelationBetweenVertices(sourceVertexId, destinationVertexId);
        return Response.created(new URI(request.getRequestURL() + "/" + ServiceUtils.encodeURL(createdEdge.id()))).build();
    }

    @DELETE
    @Path("/{edgeId}")
    public Response removeRelation(@PathParam("edgeId") String edgeId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            edgeId = ServiceUtils.decodeURL(edgeId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaEdgeManipulator.removeEdge(edgeId);
        return Response.ok().build();
    }

    @POST
    @Path("/label/{edgeId}")
    public Response modifyEdgeLabel(@PathParam("edgeId") String edgeId, @QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            edgeId = ServiceUtils.decodeURL(edgeId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaEdgeManipulator.updateLabel(edgeId, label);
        return Response.ok().build();
    }
}
