/// Liveness probe.
#[utoipa::path(get, path = "/api/v1/health", tag = "health", responses((status = 200, description = "Service is live")))]
pub async fn health() -> &'static str {
	"ok"
}
