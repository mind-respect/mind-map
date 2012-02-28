package org.triple_brain.mind_map.service.conf;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.servlet.GuiceServletContextListener;
import com.google.inject.servlet.ServletModule;
import com.ovea.tadjin.module.security.client.AuthManager;
import com.ovea.tadjin.module.security.client.SessionBasedAuthManager;
import com.ovea.tadjin.util.properties.JndiPropertySettingsProvider;
import com.ovea.tadjin.util.properties.PropertySettings;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;
import org.triple_brain.mind_map.service.resources.*;
import org.triple_brain.module.repository.user.user.UserRepository;
import org.triple_brain.module.repository_sql.SQLUserRepository;

/**
 * @author Vincent Blouin
 */
public class MyGuiceConfig extends GuiceServletContextListener {

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new ServletModule() {
            @Override
            protected void configureServlets() {
                serve("/service/*").with(GuiceContainer.class);
                PropertySettings settings = new JndiPropertySettingsProvider("settings/global", "settings/application").get();
                bind(PropertySettings.class).toInstance(settings);
                bind(AuthManager.class).toInstance(new SessionBasedAuthManager(settings.getString("security.key")));
                bind(UserRepository.class).to(SQLUserRepository.class);
                bind(DrawnGraphResource.class);
                bind(GraphResource.class);
                bind(VertexResource.class);
                bind(EdgeResource.class);


                bind(UserResource.class);
                requireBinding(PropertySettings.class);
            }
        });
    }
}
