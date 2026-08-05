import java.sql.*;

public class UserRepository {
    public void getUser(Connection conn, String name) throws SQLException {
        class Helper {
            void run() throws SQLException {
                Statement stmt = conn.createStatement();
                stmt.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");
            }
        }
        new Helper().run();
    }
}
