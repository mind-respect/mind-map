package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.mind_map.service.ServiceUtils;
import org.triple_brain.module.model.graph.Edge;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.module.model.json.StatementJSONFields.*;

/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/vertex")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class VertexResource {

    @POST
    @Path("/{sourceVertexId}")
    public Response addVertexAndEdgeToSourceVertex(@PathParam("sourceVertexId") String sourceVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try{
            sourceVertexId = ServiceUtils.decodeURL(sourceVertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        Edge createdEdge = jenaVertexManipulator.addVertexAndRelation(
                sourceVertexId
        );

        JSONObject jsonCreatedStatement = new JSONObject();
        jsonCreatedStatement.put(SUBJECT_ID, createdEdge.sourceVertex().id());
        jsonCreatedStatement.put(PREDICATE_ID, createdEdge.id());
        jsonCreatedStatement.put(OBJECT_ID, createdEdge.destinationVertex().id());
        //TODO response should be of created type
        return Response.ok(jsonCreatedStatement).build();
    }

    @DELETE
    @Path("/{vertexId}")
    public Response removeVertex(@PathParam("vertexId") String vertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = ServiceUtils.decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaVertexManipulator.removeVertex(vertexId);
        return Response.ok().build();
    }

    @POST
    @Path("label/{vertexId}")
    public Response updateVertexLabel(@PathParam("vertexId") String vertexId, @QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = ServiceUtils.decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaVertexManipulator.updateLabel(vertexId, label);
        return Response.ok().build();
    }

    @POST
    @Path("type/{vertexId}")
    public Response setType(@PathParam("vertexId") String vertexId, @QueryParam("type_uri") String typeUri) throws JSONException, URISyntaxException{
        try{
            vertexId = ServiceUtils.decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaVertexManipulator.semanticType(vertexId, typeUri);
        return Response.ok().build();
    }

    @POST
    @Path("same_as/{vertexId}")
    public Response setSameAs(@PathParam("vertexId") String vertexId, @QueryParam("same_as_uri") String sameAsUri) throws JSONException, URISyntaxException{
        try{
            vertexId = ServiceUtils.decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        jenaVertexManipulator.sameAsResourceWithUri(vertexId, sameAsUri);
        return Response.ok().build();
    }
}
