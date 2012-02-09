package org.triple_brain.mind_map.web;

import com.google.common.collect.ImmutableMap;
import com.google.inject.Provides;
import com.google.inject.servlet.RequestScoped;
import com.google.inject.servlet.ServletModule;
import com.ovea.markup.MarkupAttributes;
import com.ovea.markup.TemplateRegistry;
import com.ovea.markup.mvel.MVEL2TemplateRegistry;
import com.ovea.markup.web.MarkupServlet;
import com.ovea.tadjin.util.Application;
import com.ovea.tadjin.util.filter.SSLFilter;
import com.ovea.tadjin.util.i18n.LocaleManager;
import com.ovea.tadjin.util.i18n.LocaleValue;
import com.ovea.tadjin.util.jersey.GzipEncoder;
import com.ovea.tadjin.util.properties.JndiPropertySettingsProvider;
import com.ovea.tadjin.util.properties.PropertySettings;
import com.ovea.tadjin.util.web.CookieTemplate;
import com.ovea.tadjin.util.web.SimpleCookie;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;

import javax.inject.Singleton;
import javax.naming.Context;
import javax.naming.InitialContext;
import java.util.Locale;

/**
 * @author David Avenante
 */
public class WebModule extends ServletModule {

    @Override
    protected void configureServlets() {
        bind(Context.class).to(InitialContext.class).in(Singleton.class);
        bind(Locale.class).toProvider(LocaleManager.class);

        PropertySettings settings = new JndiPropertySettingsProvider("settings/global", "settings/application").get();
        bind(PropertySettings.class).toInstance(settings);

        serve("/service/*").with(GuiceContainer.class, com.google.common.collect.ImmutableMap.of(
                "com.sun.jersey.spi.container.ContainerResponseFilters", GzipEncoder.class.getName()
        ));
        serve("*.html").with(MarkupServlet.class);
    }
    /*
    @Provides
    @RequestScoped
    User user(AuthManager authManager, UserRepository userRepository) {
        return userRepository.findById(authManager.getCurrentUserId());
    }
      */
    @Provides
    @Singleton
    @LocaleValue
    CookieTemplate cookieTemplate(PropertySettings settings) {
        return new SimpleCookie("LOCALE")
                .withTimeout(-1)
                .withPath("/")
                .withDomain(settings.getString("cookie.domain"));
    }

    @Provides
    @Singleton
    TemplateRegistry templateRegistry() {
        MVEL2TemplateRegistry registry = new MVEL2TemplateRegistry();
        registry.setDebug(Application.DEBUG);
        return registry;
    }

    @Provides
    @RequestScoped
    MarkupAttributes markupAttributes(PropertySettings props) {
        MarkupAttributes markupAttributes = new MarkupAttributes();
        markupAttributes.set("props", props);
        return markupAttributes;
    }
}
