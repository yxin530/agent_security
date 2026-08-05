import java.sql.*;

public class UserRepository {
    public void getUser(Connection conn, String name) throws SQLException {
        Statement stmt = conn.createStatement();
        ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE name = '" + name + "'");
    }
}
