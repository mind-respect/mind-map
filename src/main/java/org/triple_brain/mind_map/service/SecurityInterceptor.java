package org.triple_brain.mind_map.service;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.inject.Provider;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Response;

/**
 * Copyright Mozilla Public License 1.1
 */
public class SecurityInterceptor implements MethodInterceptor {

    public static final String AUTHENTICATION_ATTRIBUTE_KEY = "authentified";
    
    @Inject
    private Provider<HttpServletRequest> requestProvider;

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        return isAllowedToInvokeMethod(invocation) ?
            invocation.proceed():
            Response.status(403).build();
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
