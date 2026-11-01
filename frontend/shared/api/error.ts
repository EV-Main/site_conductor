// Pull a human-readable message out of the generated client's `{ error }`
// result shape (the backend renders errors as `{ "error": "<message>" }`).
export function extractApiError(error: unknown): string {
  if (error && typeof error === "object" && "error" in error) {
    const message = (error as { error?: unknown }).error;
    if (typeof message === "string") return message;
  }
  return "Something went wrong. Please try again.";
}
