import org.triple_brain.mind_map.Launcher;
import org.triple_brain.module.neo4j_graph_manipulator.graph.Neo4JModule;

import static org.triple_brain.module.repository_sql.SQLConnection.clearDatabases;
import static org.triple_brain.module.repository_sql.SQLConnection.createTables;

public class LaunchWebapp {

    public static void main(String[] args) throws Exception {
        Neo4JModule.clearDb();
        Launcher launcher = new Launcher();
        launcher.launch();
        clearDatabases();
        createTables();
    }
}
