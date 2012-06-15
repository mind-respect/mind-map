package org.triple_brain.mind_map;

import com.google.inject.AbstractModule;
import org.apache.solr.core.CoreContainer;
import org.triple_brain.module.search.GraphIndexer;
import org.triple_brain.module.search.GraphSearch;

import java.io.File;

/*
* Copyright Mozilla Public License 1.1
*/
public class SearchTestModule extends AbstractModule {

    @Override
    protected void configure() {
        try{
            String solrHomePath = "/home/vince/Projects/triple_brain/module/search/src/test/resources/solr/";
            String solrXMLPath = "conf/solr.xml";
            File solrConfigXml = new File(solrHomePath + solrXMLPath);
            CoreContainer coreContainer = new CoreContainer(solrHomePath, solrConfigXml);
            bind(GraphIndexer.class).toInstance(GraphIndexer.withCoreContainer(coreContainer));
            bind(GraphSearch.class).toInstance(GraphSearch.withCoreContainer(coreContainer));
        }catch(Exception e){
            throw new RuntimeException(e);
        }
    }
}
