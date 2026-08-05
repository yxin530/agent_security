use sqlx::sqlite::SqlitePool;

pub async fn get_user(pool: &SqlitePool, name: &str) {
    let users = sqlx::query("SELECT * FROM users WHERE name = ?")
        .bind(name)
        .fetch_all(pool)
        .await
        .unwrap();
}
