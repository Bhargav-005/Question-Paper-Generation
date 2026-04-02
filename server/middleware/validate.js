

/**
 * Validates that the paperId in params is a valid UUID.
 * Prevents "invalid input syntax for type uuid" errors in Postgres.
 */
export function validatePaperId(req, res, next) {
  const { paperId, id } = req.params;
  const targetId = paperId || id;

  // UUID v4 regex
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (targetId && !uuidRegex.test(targetId)) {
    console.warn(`[VALIDATE] Invalid ID rejected: ${targetId} for path: ${req.path}`);
    return res.status(400).json({
      success: false,
      message: `Invalid ID format. Expected UUID, got: ${targetId}`
    });
  }

  next();
}