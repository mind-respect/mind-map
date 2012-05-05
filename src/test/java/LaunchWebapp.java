import org.triple_brain.mind_map.Launcher;

import static org.triple_brain.module.repository_sql.SQLConnection.clearDatabases;
import static org.triple_brain.module.repository_sql.SQLConnection.createTables;

public class LaunchWebapp {

    public static void main(String[] args) throws Exception {
        Launcher launcher = new Launcher();
        launcher.launch();
        clearDatabases();
        createTables();
    }
}
