package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.GraphElementIdentifier;
import org.triple_brain.module.model.graph.Vertex;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.common_utils.CommonUtils.decodeURL;
import static org.triple_brain.module.common_utils.CommonUtils.encodeURL;


/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/edge")
@Produces(MediaType.APPLICATION_JSON)
public class EdgeResource {

    @POST
    @Path("/{sourceVertexId}/{destinationVertexId}")
    public Response addRelation(@GraphElementIdentifier @PathParam("sourceVertexId") String sourceVertexId, @GraphElementIdentifier @PathParam("destinationVertexId") String destinationVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException, UnsupportedEncodingException {
        try{
            sourceVertexId = decodeURL(sourceVertexId);
            destinationVertexId = decodeURL(destinationVertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex sourceVertex = graphManipulator.vertexWithURI(sourceVertexId);
        Vertex destinationVertex = graphManipulator.vertexWithURI(destinationVertexId);
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
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Edge edge = graphManipulator.edgeWithUri(edgeId);
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
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Edge edge = graphManipulator.edgeWithUri(edgeId);
        edge.label(label);
        return Response.ok().build();
    }
}
