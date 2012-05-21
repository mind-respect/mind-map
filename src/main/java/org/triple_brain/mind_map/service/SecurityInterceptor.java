package org.triple_brain.mind_map.service;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.triple_brain.module.model.User;
import org.triple_brain.module.model.graph.GraphElementIdentifier;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;
import java.lang.annotation.Annotation;
import java.net.URI;

import static org.triple_brain.mind_map.service.ServiceUtils.usernameInURI;
import static org.triple_brain.mind_map.service.resources.GraphManipulatorResourceUtils.userFromSession;

/**
 * Copyright Mozilla Public License 1.1
 */
public class SecurityInterceptor implements MethodInterceptor {

    public static final String AUTHENTICATION_ATTRIBUTE_KEY = "authentified";
    public static final String AUTHENTICATED_USER_KEY = "authenticated_user";
    
    @Inject
    private Provider<HttpServletRequest> requestProvider;

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        if(!isAllowedToInvokeMethod(invocation)){
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        try{
            if(!hasCurrentUserAccessToGraphElementsInMethod(invocation)){
                return Response.status(Response.Status.FORBIDDEN).build();
            }
        }catch(Exception e){
            return Response.status(Response.Status.BAD_REQUEST).build();
        }

        return invocation.proceed();
    }

    private boolean isAllowedToInvokeMethod(MethodInvocation methodInvocation){
        if (isClassOfMethodAccessibleByAll(methodInvocation)) {
            return true;
        }else {
            return isUserAuthentified();
        }
    }

    private boolean isUserAuthentified(){
        Object authentifiedAttribute = requestProvider.get().getSession().getAttribute(AUTHENTICATION_ATTRIBUTE_KEY);
        return authentifiedAttribute != null && (Boolean) authentifiedAttribute;
    }

    private boolean isClassOfMethodAccessibleByAll(MethodInvocation methodInvocation){
        return permitAllAnnotationOfMethod(methodInvocation) != null;
    }

    private PermitAll permitAllAnnotationOfMethod(MethodInvocation methodInvocation){
        return getClassAnnotations(methodInvocation.getThis().getClass(), PermitAll.class);
    }

    private boolean hasCurrentUserAccessToGraphElementsInMethod(MethodInvocation invocation) throws Exception {
        Annotation[][] parametersAnnotations = invocation.getMethod().getParameterAnnotations();
        for(int parameterIndex = 0 ; parameterIndex < parametersAnnotations.length; parameterIndex++){
            if(annotationsHaveGraphElementIdentifierAnnotation(parametersAnnotations[parameterIndex])){
                URI uri = URI.create((String) invocation.getArguments()[parameterIndex]);
                if(!doesCurrentUserHaveAccessToURI(uri)){
                    return false;
                }
            }
        }
        return true;
    }

    private boolean doesCurrentUserHaveAccessToURI(URI uri){
        User currentUser = userFromSession(requestProvider.get().getSession());
        return usernameInURI(uri).equals(currentUser.username());
    }

    private boolean annotationsHaveGraphElementIdentifierAnnotation(Annotation[] annotations){
        for(int i = 0; i < annotations.length; i++){
            if(isGraphElementIdentifierAnnotation(annotations[i])){
                return true;
            }
        }
        return false;
    }

    private boolean isGraphElementIdentifierAnnotation(Annotation annotation){
        return annotation.annotationType().getCanonicalName().equals(GraphElementIdentifier.class.getCanonicalName());
    }

    private <T> T getClassAnnotations(Class clazz, Class<T> annotationClass) {

        if ( clazz == Object.class ) {

            return null;
        }

        T annotation = (T) clazz.getAnnotation(annotationClass);
        if ( annotation != null ) {

            return annotation;
        } else {

            return getClassAnnotations(clazz.getSuperclass(), annotationClass);
        }
    }
}
