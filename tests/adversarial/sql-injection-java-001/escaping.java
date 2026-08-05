import jakarta.persistence.EntityManager;

public class UserRepository {
    public void getUser(EntityManager em, String name) {
        em.createNativeQuery("SELECT * FROM users WHERE name = \"" + name + "\"");
    }
}
