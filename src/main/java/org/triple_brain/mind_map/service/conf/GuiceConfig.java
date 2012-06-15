package org.triple_brain.mind_map.service.conf;

import com.google.inject.Guice;
import com.google.inject.Injector;
import com.google.inject.matcher.Matchers;
import com.google.inject.name.Names;
import com.google.inject.servlet.GuiceServletContextListener;
import com.sun.jersey.guice.JerseyServletModule;
import com.sun.jersey.guice.spi.container.servlet.GuiceContainer;
import org.apache.solr.core.CoreContainer;
import org.triple_brain.graphmanipulator.jena.JenaConnection;
import org.triple_brain.mind_map.service.SecurityInterceptor;
import org.triple_brain.mind_map.service.resources.*;
import org.triple_brain.module.repository.user.UserRepository;
import org.triple_brain.module.repository_sql.SQLModule;
import org.triple_brain.module.repository_sql.SQLUserRepository;
import org.triple_brain.module.search.GraphIndexer;
import org.triple_brain.module.search.GraphSearch;
import org.triple_brain.module.search.SearchUtils;
import org.xml.sax.SAXException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import javax.ws.rs.Path;
import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;

import static com.google.inject.jndi.JndiIntegration.fromJndi;

/**
 * Copyright Mozilla Public License 1.1
 */
public class GuiceConfig extends GuiceServletContextListener {

    @Override
    protected Injector getInjector() {
        return Guice.createInjector(new JerseyServletModule() {
            @Override
            protected void configureServlets() {
                bind(Context.class).to(InitialContext.class);
                SecurityInterceptor securityInterceptor = new SecurityInterceptor();
                requestInjection(securityInterceptor);

                bindInterceptor(Matchers.any(), Matchers.annotatedWith(Path.class),
                        securityInterceptor);
                install(new SQLModule());

                bind(UserRepository.class).to(SQLUserRepository.class);
                bind(DrawnGraphResource.class);
                bind(GraphResource.class);
                bind(VertexResource.class);
                bind(EdgeResource.class);
                bind(UserResource.class);
                bind(SearchResource.class);
                serve("/service/*").with(GuiceContainer.class);

                try{
                    final InitialContext jndiContext = new InitialContext();
                    String solrHomePath = (String) jndiContext.lookup("solr_home_path");
                    String solrXMLPath = (String) jndiContext.lookup("solr_xml_path_relative_to_home");
                    File solrConfigXml = new File(solrHomePath + solrXMLPath);
                    CoreContainer coreContainer = new CoreContainer(solrHomePath, solrConfigXml);
                    bind(GraphIndexer.class).toInstance(GraphIndexer.withCoreContainer(coreContainer));
                    bind(GraphSearch.class).toInstance(GraphSearch.withCoreContainer(coreContainer));
                    String isTesting = (String) jndiContext.lookup("is_testing");
                    if("yes".equals(isTesting)){
                        bind(ResourceForTests.class);
                        bind(SearchUtils.class).toInstance(
                                SearchUtils.usingCoreCoreContainer(coreContainer)
                        );
                    }
                }catch(NamingException | ParserConfigurationException | IOException | SAXException e){
                    throw new RuntimeException(e);
                }

                bind(DataSource.class)
                        .annotatedWith(Names.named("nonRdfDb"))
                        .toProvider(fromJndi(DataSource.class, "jdbc/nonRdfTripleBrainDB"));

                requestStaticInjection(JenaConnection.class);

                bind(DataSource.class)
                        .annotatedWith(Names.named("jenaDB"))
                        .toProvider(fromJndi(DataSource.class, "jdbc/jenaTripleBrainDB"));

                bind(String.class)
                        .annotatedWith(Names.named("jenaDatabaseTypeName"))
                        .toProvider(fromJndi(String.class, "jdbc/jenaTripleBrainDBTypeName"));

            }
        });
    }
}
