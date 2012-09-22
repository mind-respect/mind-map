package org.triple_brain.mind_map.service.utils;

import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.json.graph.VertexJsonFields;

import javax.ws.rs.core.NewCookie;
import java.net.URI;

import static org.triple_brain.module.common_utils.Uris.encodeURL;

/*
* Copyright Mozilla Public License 1.1
*/
public class VertexRestTestUtils {

    private WebResource resource;
    private NewCookie authCookie;

    public static VertexRestTestUtils withWebResourceAndAuthCookie(WebResource resource, NewCookie authCookie){
        return new VertexRestTestUtils(resource, authCookie);
    }
    protected VertexRestTestUtils(WebResource resource, NewCookie authCookie){
        this.resource = resource;
        this.authCookie = authCookie;
    }

    public JSONObject vertexWithUri(URI vertexUri){
        ClientResponse response = resource
                .path("test")
                .path("vertex")
                .path(Uris.encodeURL(vertexUri.toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        return response.getEntity(JSONObject.class);
    }

    public JSONArray connectedEdgesOfVertexWithURI(URI vertexUri) {
        ClientResponse response = resource
                .path("test")
                .path("vertex")
                .path("connected_edges")
                .path(Uris.encodeURL(vertexUri.toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        return response.getEntity(JSONArray.class);
    }

    public boolean vertexWithUriHasDestinationVertexWithUri(URI vertexUri, URI destinationVertexUri){
        ClientResponse response = resource
                .path("test")
                .path("vertex")
                .path(Uris.encodeURL(vertexUri.toString()))
                .path("has_destination")
                .path(Uris.encodeURL(destinationVertexUri.toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        return response.getEntity(Boolean.class);
    }

    public URI uriOfVertex(JSONObject jsonObject){
        try{
            return Uris.get(jsonObject.getString(VertexJsonFields.ID));
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
    }

    public boolean vertexIsInVertices(JSONObject vertex, JSONArray vertices){
        try{
            for(int i = 0 ; i < vertices.length() ; i++){
                JSONObject edgeToCompare = vertices.getJSONObject(i);
                if(uriOfVertex(edgeToCompare).equals(uriOfVertex(vertex))){
                    return true;
                }
            }
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
        return false;
    }

    public ClientResponse addAVertexToVertexAWithUri(URI vertexUri) throws Exception {
        ClientResponse response = resource
                .path("vertex")
                .path(encodeURL(vertexUri.toString()))
                .cookie(authCookie)
                .post(ClientResponse.class);
        return response;
    }
}
