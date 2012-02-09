package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Statement;
import org.codehaus.jettison.json.JSONException;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URI;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaEdgeManipulator;

/**
 * @author Vincent Blouin
 */
@Path("/edge")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class EdgeResource {

    @POST
    @Path("/{sourceVertexId}/{destinationVertexId}")
    public Response addRelation(@PathParam("sourceVertexId") String sourceVertexId, @PathParam("destinationVertexId") String destinationVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        Statement createdStatement = jenaEdgeManipulator.addRelationBetweenVertices(sourceVertexId, destinationVertexId);
        return Response.created(new URI(request.getRequestURL() + "/" + createdStatement.getPredicate().asResource().getLocalName())).build();
    }

    @DELETE
    @Path("/{edgeId}")
    public Response removeRelation(@PathParam("edgeId") String edgeId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        jenaEdgeManipulator.removeEdge(edgeId);
        return Response.ok().build();
    }

    @POST
    @Path("/label/{edgeId}")
    public Response modifyEdgeLabel(@PathParam("edgeId") String edgeId,@QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        jenaEdgeManipulator.updateLabel(edgeId, label);
        return Response.ok().build();
    }
}
