package org.triple_brain.mind_map.service.resources;

import com.google.inject.assistedinject.Assisted;
import com.google.inject.assistedinject.AssistedInject;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.mind_map.service.ExternalResourceServiceUtils;
import org.triple_brain.module.model.*;
import org.triple_brain.module.model.graph.Edge;
import org.triple_brain.module.model.graph.UserGraph;
import org.triple_brain.module.model.graph.Vertex;
import org.triple_brain.module.model.json.ExternalResourceJson;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;
import org.triple_brain.module.model.json.graph.VertexJsonFields;
import org.triple_brain.module.model.suggestion.Suggestion;
import org.triple_brain.module.model.suggestion.SuggestionOrigin;
import org.triple_brain.module.search.GraphIndexer;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.io.UnsupportedEncodingException;
import java.net.URI;

import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;
import static org.triple_brain.module.common_utils.Uris.decodeURL;
import static org.triple_brain.module.model.json.StatementJsonFields.*;
import static org.triple_brain.module.model.json.SuggestionJsonFields.*;

/**
 * Copyright Mozilla Public License 1.1
 */
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VertexResource {

    @Inject
    GraphIndexer graphIndexer;

    @Inject
    BeforeAfterEachRestCall beforeAfterEachRestCall;

    @Inject
    ExternalResourceServiceUtils externalResourceServiceUtils;

    private UserGraph userGraph;

    @AssistedInject
    public VertexResource(
            @Assisted UserGraph userGraph
    ){
        this.userGraph = userGraph;
    }

    @POST
    @Path("/{sourceVertexId}")
    public Response addVertexAndEdgeToSourceVertex(
            @Context HttpServletRequest request
    ) {
        Vertex sourceVertex = userGraph.vertexWithURI(URI.create(
            request.getRequestURI()
        ));
        Edge createdEdge = sourceVertex.addVertexAndRelation();
        Vertex createdVertex = createdEdge.destinationVertex();
        graphIndexer.indexVertexOfUser(
                createdVertex,
                userFromSession(request.getSession())
        );
        JSONObject jsonCreatedStatement = new JSONObject();
        try {
            jsonCreatedStatement.put(
                    SOURCE_VERTEX, VertexJsonFields.toJson(sourceVertex)
            );
            jsonCreatedStatement.put(
                    EDGE, EdgeJsonFields.toJson(createdEdge)
            );
            jsonCreatedStatement.put(
                    END_VERTEX, VertexJsonFields.toJson(createdVertex)
            );
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
        //TODO response should be of type created
        return Response.ok(jsonCreatedStatement).build();
    }

    @DELETE
    @Path("/{vertexId}")
    public Response removeVertex(
            @Context HttpServletRequest request
    ) {
        graphIndexer.deleteVertexOfUser(
                userGraph.vertexWithURI(URI.create(
                    request.getRequestURI()
                )),
                userGraph.user()
        );
        Vertex vertex = userGraph.vertexWithURI(URI.create(
                request.getRequestURI()
        ));
        vertex.remove();
        return Response.ok().build();
    }

    @POST
    @Path("{shortId}/label")
    public Response updateVertexLabel(
            @PathParam("shortId") String shortId,
            @QueryParam("label") String label
    ) {
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
                vertexId
        );
        vertex.label(label);

        graphIndexer.indexVertexOfUser(
                vertex,
                userGraph.user()
        );
        return Response.ok().build();
    }

    @POST
    @Path("{shortId}/type")
    public Response addType(
            @PathParam("shortId") String shortId,
            JSONObject type
    ) {
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
                vertexId
        );
        ExternalFriendlyResource externalFriendlyResource = ExternalResourceJson.fromJson(type);
        vertex.addType(
                externalFriendlyResource
        );
        updateImagesOfExternalResourceIfNecessary(externalFriendlyResource);
        updateDescriptionOfExternalResourceIfNecessary(externalFriendlyResource);
        return Response.ok().build();
    }

    public void updateImagesOfExternalResourceIfNecessary(ExternalFriendlyResource externalFriendlyResource) {
        if (!externalFriendlyResource.gotTheImages()) {
            if (FreebaseExternalFriendlyResource.isFromFreebase(externalFriendlyResource)) {
                FreebaseExternalFriendlyResource freebaseResource = FreebaseExternalFriendlyResource.fromExternalResource(
                        externalFriendlyResource
                );
                freebaseResource.getImages(
                        externalResourceServiceUtils.imagesUpdateHandler
                );
            }
        }
    }

    public void updateDescriptionOfExternalResourceIfNecessary(ExternalFriendlyResource externalFriendlyResource) {
        if (!externalFriendlyResource.gotADescription()) {
            if (FreebaseExternalFriendlyResource.isFromFreebase(externalFriendlyResource)) {
                FreebaseExternalFriendlyResource freebaseResource = FreebaseExternalFriendlyResource.fromExternalResource(
                        externalFriendlyResource
                );
                freebaseResource.getDescription(
                        externalResourceServiceUtils.descriptionUpdateHandler
                );
            }
        }
    }

    @POST
    @Path("{shortId}/same_as")
    public Response addSameAs(
            @PathParam("shortId") String shortId,
            JSONObject sameAs
    ) {
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
            vertexId
        );
        ExternalFriendlyResource externalFriendlyResource = ExternalResourceJson.fromJson(sameAs);
        vertex.addSameAs(
                externalFriendlyResource
        );

        updateImagesOfExternalResourceIfNecessary(externalFriendlyResource);
        updateDescriptionOfExternalResourceIfNecessary(externalFriendlyResource);
        return Response.ok().build();
    }

    @DELETE
    @Path("{shortId}/identification/{friendly_resource_uri}")
    public Response removeFriendlyResource(
            @PathParam("shortId") String shortId,
            @PathParam("friendly_resource_uri") String friendlyResourceUri
    ) {
        try{
            friendlyResourceUri = decodeURL(friendlyResourceUri);
        } catch (UnsupportedEncodingException e) {
            return Response.status(Response.Status.BAD_REQUEST).build();
        }
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
                vertexId
        );
        ExternalFriendlyResource type = vertex.friendlyResourceWithUri(
                URI.create(friendlyResourceUri)
        );
        vertex.removeFriendlyResource(type);
        return Response.ok().build();
    }

    @GET
    @Path("{shortId}/suggestions")
    public Response getSuggestions(
            @PathParam("shortId") String shortId
    ) {
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
                vertexId
        );
        try {
            JSONArray suggestions = VertexJsonFields.toJson(vertex)
                    .getJSONArray(VertexJsonFields.SUGGESTIONS);
            return Response.ok(suggestions).build();
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    @POST
    @Path("{shortId}/suggestions")
    public Response addSuggestions(
            @PathParam("shortId") String shortId,
            JSONArray suggestions
    ) {        
        URI vertexId = uriFromShortId(shortId);
        Vertex vertex = userGraph.vertexWithURI(
            vertexId
        );
        vertex.addSuggestions(
                suggestionsSetFromJSONArray(suggestions)
        );
        return Response.ok().build();
    }

    private Suggestion[] suggestionsSetFromJSONArray(JSONArray jsonSuggestions) {
        Suggestion[] suggestions = new Suggestion[jsonSuggestions.length()];
        for (int i = 0; i < jsonSuggestions.length(); i++) {
            try {
                JSONObject jsonSuggestion = jsonSuggestions.getJSONObject(i);
                suggestions[i] = Suggestion.withSameAsDomainLabelAndOrigins(
                        URI.create(jsonSuggestion.getString(TYPE_URI)),
                        URI.create(jsonSuggestion.getString(DOMAIN_URI)),
                        jsonSuggestion.getString(LABEL),
                        SuggestionOrigin.valueOf(jsonSuggestion.getString(ORIGIN))
                );
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }
        }
        return suggestions;
    }

    private URI uriFromShortId(String shortId){
        return  new UserUris(
                userGraph.user()
        ).vertexUriFromShortId(
                shortId
        );
    }

}
