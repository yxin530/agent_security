use sqlx::sqlite::SqlitePool;

pub async fn get_user(pool: &SqlitePool, name: &str) {
    let users = sqlx::query(&format!("SELECT * FROM users WHERE name = '{}'", name))
        .fetch_all(pool)
        .await
        .unwrap();
}
