package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.graphmanipulator.jena.graph.JenaGraphManipulator;
import org.triple_brain.module.model.ExternalResource;
import org.triple_brain.module.model.Suggestion;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.GraphElementIdentifier;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.model.json.ExternalResourceJsonFields;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;
import org.triple_brain.module.model.json.graph.VertexJsonFields;
import org.triple_brain.module.search.GraphIndexer;

import javax.inject.Inject;
import javax.inject.Singleton;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashSet;
import java.util.Set;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.common_utils.CommonUtils.decodeURL;
import static org.triple_brain.module.model.json.StatementJsonFields.*;
import static org.triple_brain.module.model.json.SuggestionJsonFields.*;
/**
 * Copyright Mozilla Public License 1.1
 */
@Path("/vertex")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Singleton
public class VertexResource {

    @Inject
    GraphIndexer graphIndexer;

    @POST
    @Path("/{sourceVertexId}")
    public Response addVertexAndEdgeToSourceVertex(@GraphElementIdentifier @PathParam("sourceVertexId") String sourceVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try{
            sourceVertexId = decodeURL(sourceVertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex sourceVertex = graphManipulator.vertexWithURI(sourceVertexId);
        Edge createdEdge = sourceVertex.addVertexAndRelation();
        Vertex createdVertex = createdEdge.destinationVertex();
        graphIndexer.indexVertexOfUser(
                createdVertex,
                userFromSession(request.getSession())
        );
        JSONObject jsonCreatedStatement = new JSONObject();
        jsonCreatedStatement.put(
                SOURCE_VERTEX, VertexJsonFields.toJson(sourceVertex)
        );
        jsonCreatedStatement.put(
                EDGE, EdgeJsonFields.toJson(createdEdge)
        );
        jsonCreatedStatement.put(
                END_VERTEX, VertexJsonFields.toJson(createdVertex)
        );
        //TODO response should be of created type
        return Response.ok(jsonCreatedStatement).build();
    }

    @DELETE
    @Path("/{vertexId}")
    public Response removeVertex(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        User authenticatedUser = userFromSession(request.getSession());

        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                authenticatedUser
        );
        graphIndexer.deleteVertexOfUser(
                graphManipulator.vertexWithURI(vertexId),
                authenticatedUser
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.remove();
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/label")
    public Response updateVertexLabel(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        User authenticatedUser = userFromSession(request.getSession());
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                authenticatedUser
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.label(label);

        graphIndexer.indexVertexOfUser(
                graphManipulator.vertexWithURI(vertexId),
                authenticatedUser
        );
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/type")
    public Response setType(@GraphElementIdentifier @PathParam("vertexId") String vertexId, JSONObject type, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.setTheAdditionalType(
                externalResourceFromJson(type)
        );
        return Response.ok().build();
    }

    @DELETE
    @Path("{vertexId}/type")
    public Response removeTheAdditionalType(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @Context HttpServletRequest request){
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.removeTheAdditionalType();
        return Response.ok().build();
    }

    private ExternalResource externalResourceFromJson(JSONObject externalResource)throws JSONException, URISyntaxException{
        return ExternalResource.withUriAndLabel(
                new URI(
                        externalResource.getString(
                            ExternalResourceJsonFields.URI
                        )
                ),
                externalResource.getString(
                        ExternalResourceJsonFields.LABEL
                )
        );
    }

    @POST
    @Path("{vertexId}/same_as")
    public Response setSameAs(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @QueryParam("same_as_uri") String sameAsUri, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator= JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.setSameAsUsingUri(sameAsUri);
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/suggestions")
    public Response setSuggestions(@GraphElementIdentifier @PathParam("vertexId") String vertexId, JSONArray suggestions, @Context HttpServletRequest request) throws JSONException, URISyntaxException{
        try{
            vertexId = decodeURL(vertexId);
        }catch (UnsupportedEncodingException e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        JenaGraphManipulator graphManipulator = JenaGraphManipulator.withUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = graphManipulator.vertexWithURI(vertexId);
        vertex.suggestions(
                suggestionsSetFromJSONArray(suggestions)
        );
        return Response.ok().build();
    }

    private Set<Suggestion> suggestionsSetFromJSONArray(JSONArray jsonSuggestions)throws JSONException, URISyntaxException{
        Set<Suggestion> suggestions = new HashSet<Suggestion>();
        for(int i = 0 ; i < jsonSuggestions.length(); i++){
            JSONObject jsonSuggestion = jsonSuggestions.getJSONObject(i);
            suggestions.add(Suggestion.withTypeDomainAndLabel(
                    new URI(jsonSuggestion.getString(TYPE_URI)),
                    new URI(jsonSuggestion.getString(DOMAIN_URI)),
                    jsonSuggestion.getString(LABEL)
            ));
        }
        return suggestions;
    }

}
