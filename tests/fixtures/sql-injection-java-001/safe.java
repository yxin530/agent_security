import java.sql.*;

public class UserRepository {
    public void getUser(Connection conn, String name) throws SQLException {
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
        stmt.setString(1, name);
        ResultSet rs = stmt.executeQuery();
    }
}
