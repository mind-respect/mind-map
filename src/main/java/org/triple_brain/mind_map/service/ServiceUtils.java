package org.triple_brain.mind_map.service;

import java.io.UnsupportedEncodingException;
import java.net.URI;

/*
* Copyright Mozilla Public License 1.1
*/
public class ServiceUtils {
    public static String encodeURL(String URL) throws UnsupportedEncodingException{
        return java.net.URLEncoder.encode(URL, "ISO-8859-1");
    }
    public static String decodeURL(String URL) throws UnsupportedEncodingException{
        return java.net.URLDecoder.decode(URL, "ISO-8859-1");
    }

    public static String usernameInURI(URI uri){
        return uri.getPath().split("\\/")[1];
    }
}
