package org.triple_brain.mind_map.service.utils;

import com.sun.jersey.api.client.ClientResponse;
import com.sun.jersey.api.client.WebResource;
import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.triple_brain.module.common_utils.Uris;
import org.triple_brain.module.model.json.graph.EdgeJsonFields;

import javax.ws.rs.core.NewCookie;
import java.net.URI;

/*
* Copyright Mozilla Public License 1.1
*/
public class EdgeRestTestUtils {

    private WebResource resource;
    private NewCookie authCookie;

    public static EdgeRestTestUtils withWebResourceAndAuthCookie(WebResource resource, NewCookie authCookie){
        return new EdgeRestTestUtils(resource, authCookie);
    }
    protected EdgeRestTestUtils(WebResource resource, NewCookie authCookie){
        this.resource = resource;
        this.authCookie = authCookie;
    }

    public URI uriOfEdge(JSONObject jsonObject){
        try{
            return Uris.get(jsonObject.getString(EdgeJsonFields.ID));
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
    }

    public JSONObject edgeWithUri(URI edgeUri){
        ClientResponse response = resource
                .path("users")
                .path("test")
                .path("edge")
                .path(Uris.encodeURL(edgeUri.toString()))
                .cookie(authCookie)
                .get(ClientResponse.class);
        return response.getEntity(JSONObject.class);
    }

    public boolean edgeIsInEdges(JSONObject edge, JSONArray edges){
        try{
            for(int i = 0 ; i < edges.length() ; i++){
                JSONObject edgeToCompare = edges.getJSONObject(i);
                if(uriOfEdge(edgeToCompare).equals(uriOfEdge(edge))){
                    return true;
                }
            }
        }catch(JSONException e){
            throw new RuntimeException(e);
        }
        return false;
    }

    public JSONObject edgeBetweenTwoVerticesUriGivenEdges(URI firstVertexUri, URI secondVertexUri, JSONArray edges){
        try{
            for(int i = 0 ; i < edges.length(); i++){
                JSONObject edge = edges.getJSONObject(i);
                URI sourceVertexId = URI.create(
                        edge.getString(EdgeJsonFields.SOURCE_VERTEX_ID)
                );
                URI destinationVertexId = URI.create(
                        edge.getString(EdgeJsonFields.DESTINATION_VERTEX_ID)
                );
                if(oneOfTwoUriIsUri(firstVertexUri, secondVertexUri, sourceVertexId) &&
                        oneOfTwoUriIsUri(firstVertexUri, secondVertexUri, destinationVertexId)){
                    return edge;
                }
            }
        }catch(Exception e){
            throw new RuntimeException(e);
        }
        throw new RuntimeException("none found !");
    }

    private boolean oneOfTwoUriIsUri(URI first, URI second, URI toCompare){
        return first.equals(toCompare) ||
                second.equals(toCompare);
    }

}
