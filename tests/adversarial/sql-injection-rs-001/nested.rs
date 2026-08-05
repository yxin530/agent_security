use sqlx::sqlite::SqlitePool;

pub async fn get_user(pool: &SqlitePool, name: &str) {
    async fn inner(p: &SqlitePool, n: &str) {
        let users = sqlx::query(&format!("SELECT * FROM users WHERE name = '{}'", n))
            .fetch_all(p)
            .await
            .unwrap();
    }
    inner(pool, name).await;
}
