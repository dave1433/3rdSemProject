export function getErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    return "Failed to submit. Please try again.";
}
