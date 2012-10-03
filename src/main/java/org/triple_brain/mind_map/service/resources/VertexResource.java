package org.triple_brain.mind_map.service.resources;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.module.model.ExternalFriendlyResource;
import org.triple_brain.module.model.suggestion.Suggestion;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.*;
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

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.common_utils.Uris.decodeURL;
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

    @Inject
    GraphFactory graphFactory;

    @POST
    @Path("/{sourceVertexId}")
    public Response addVertexAndEdgeToSourceVertex(@GraphElementIdentifier @PathParam("sourceVertexId") String sourceVertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            sourceVertexId = decodeURL(sourceVertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex sourceVertex = userGraph.vertexWithURI(
                new URI(sourceVertexId)
        );
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
        //TODO response should be of type created
        return Response.ok(jsonCreatedStatement).build();
    }

    @DELETE
    @Path("/{vertexId}")
    public Response removeVertex(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            vertexId = decodeURL(vertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        User authenticatedUser = userFromSession(request.getSession());
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        graphIndexer.deleteVertexOfUser(
                userGraph.vertexWithURI(new URI(vertexId)),
                authenticatedUser
        );
        Vertex vertex = userGraph.vertexWithURI(new URI(vertexId));
        vertex.remove();
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/label")
    public Response updateVertexLabel(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @QueryParam("label") String label, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            vertexId = decodeURL(vertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        User authenticatedUser = userFromSession(request.getSession());
        UserGraph userGraph = graphFactory.loadForUser(
                authenticatedUser
        );
        Vertex vertex = userGraph.vertexWithURI(
                new URI(vertexId)
        );
        vertex.label(label);

        graphIndexer.indexVertexOfUser(
                userGraph.vertexWithURI(
                        new URI(vertexId)
                ),
                authenticatedUser
        );
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/type")
    public Response addType(@GraphElementIdentifier @PathParam("vertexId") String vertexId, JSONObject type, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            vertexId = decodeURL(vertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = userGraph.vertexWithURI(
                new URI(vertexId)
        );
        vertex.addType(
                friendlyResourceFromJson(type)
        );
        return Response.ok().build();
    }

    private ExternalFriendlyResource friendlyResourceFromJson(JSONObject externalResource) throws JSONException, URISyntaxException {
        return ExternalFriendlyResource.withUriAndLabel(
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
    public Response setSameAs(@GraphElementIdentifier @PathParam("vertexId") String vertexId, JSONObject sameAs, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            vertexId = decodeURL(vertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = userGraph.vertexWithURI(
                new URI(vertexId)
        );
        vertex.addSameAs(
                friendlyResourceFromJson(sameAs)
        );
        return Response.ok().build();
    }

    @DELETE
    @Path("{vertexId}/identification/{friendly_resource_uri}")
    public Response removeFriendlyResource(@GraphElementIdentifier @PathParam("vertexId") String vertexId, @PathParam("friendly_resource_uri") String friendlyResourceUri, @Context HttpServletRequest request) throws URISyntaxException, JSONException {
        try {
            vertexId = decodeURL(vertexId);
            friendlyResourceUri = decodeURL(friendlyResourceUri);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = userGraph.vertexWithURI(
                new URI(vertexId)
        );
        ExternalFriendlyResource type = vertex.friendlyResourceWithUri(
                new URI(friendlyResourceUri)
        );
        vertex.removeFriendlyResource(type);
        return Response.ok().build();
    }

    @POST
    @Path("{vertexId}/suggestions")
    public Response addSuggestions(@GraphElementIdentifier @PathParam("vertexId") String vertexId, JSONArray suggestions, @Context HttpServletRequest request) throws JSONException, URISyntaxException {
        try {
            vertexId = decodeURL(vertexId);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        UserGraph userGraph = graphFactory.loadForUser(
                userFromSession(request.getSession())
        );
        Vertex vertex = userGraph.vertexWithURI(
                new URI(vertexId)
        );
        vertex.addSuggestions(
                suggestionsSetFromJSONArray(suggestions)
        );
        return Response.ok().build();
    }

    private Suggestion[] suggestionsSetFromJSONArray(JSONArray jsonSuggestions) throws JSONException, URISyntaxException {
        Suggestion[] suggestions = new Suggestion[jsonSuggestions.length()];
        for (int i = 0; i < jsonSuggestions.length(); i++) {
            JSONObject jsonSuggestion = jsonSuggestions.getJSONObject(i);
            suggestions[i] = Suggestion.withSameAsDomainLabelAndOrigins(
                    new URI(jsonSuggestion.getString(TYPE_URI)),
                    new URI(jsonSuggestion.getString(DOMAIN_URI)),
                    jsonSuggestion.getString(LABEL)
            );
        }
        return suggestions;
    }

}
