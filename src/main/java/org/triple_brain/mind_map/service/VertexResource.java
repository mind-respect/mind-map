package org.triple_brain.mind_map.service;

import com.hp.hpl.jena.rdf.model.Statement;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;

import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.net.URISyntaxException;

import static org.triple_brain.mind_map.service.SingleUserTempClass.jenaVertexManipulator;
import static org.triple_brain.model.json.StatementJSONFields.OBJECT_ID;
import static org.triple_brain.model.json.StatementJSONFields.PREDICATE_ID;
import static org.triple_brain.model.json.StatementJSONFields.SUBJECT_ID;

/**
 * @author Vincent Blouin
 */
@Path("/vertex")
@Produces(MediaType.APPLICATION_JSON)
@Singleton
public class VertexResource {

    @POST
    @Path("/{sourceVertexId}")
    public Response addVertexAndEdgeToSourceVertex(@PathParam("sourceVertexId") String sourceVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        Statement createdStatement = jenaVertexManipulator.addVertexAndRelation(sourceVertexId);

        JSONObject jsonCreatedStatement = new JSONObject();
        jsonCreatedStatement.put(SUBJECT_ID, createdStatement.getSubject().asResource().getLocalName());
        jsonCreatedStatement.put(PREDICATE_ID, createdStatement.getPredicate().asResource().getLocalName());
        jsonCreatedStatement.put(OBJECT_ID, createdStatement.getObject().asResource().getLocalName());
        //TODO response should be of created type
        return Response.ok(jsonCreatedStatement).build();
    }

    @DELETE
    @Path("/{vertexId}")
    public Response removeVertex(@PathParam("vertexId") String vertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        jenaVertexManipulator.removeVertex(vertexId);
        return Response.ok().build();
    }

    @POST
    @Path("label/{vertexId}")
    public Response updateVertexLabel(@PathParam("vertexId") String vertexId,@QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        jenaVertexManipulator.updateLabel(vertexId, label);
        return Response.ok().build();
    }

    @POST
    @Path("type/{vertexId}")
    public Response setType(@PathParam("vertexId") String vertexId, @QueryParam("type_uri") String typeUri) throws JSONException, URISyntaxException{
        jenaVertexManipulator.semanticType(vertexId, typeUri);
        return Response.ok().build();
    }

    @POST
    @Path("same_as/{vertexId}")
    public Response setSameAs(@PathParam("vertexId") String vertexId, @QueryParam("same_as_uri") String sameAsUri) throws JSONException, URISyntaxException{
        jenaVertexManipulator.sameAsResourceWithUri(vertexId, sameAsUri);
        return Response.ok().build();
    }
}
