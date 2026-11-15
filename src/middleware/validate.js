import { ApiError } from "../utils/ApiError.js";

/**
 * Validates req.body (default) or req.query against a zod schema.
 * Body: req.body is replaced with the parsed data, so unknown fields never reach the database.
 * Query: Express 5 makes req.query read-only, so the parsed data goes on res.locals.query.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
    const result = schema.safeParse(source === "query" ? req.query : req.body ?? {});

    if (!result.success) {
        const issues = result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }));
        return next(ApiError.badRequest(issues[0].message, issues));
    }

    if (source === "query") res.locals.query = result.data;
    else req.body = result.data;
    next();
};

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;

/** router.param handler: rejects ids that are not Mongo ObjectIds before they reach the database. */
export const validateObjectId = (req, res, next, id) => {
    if (!OBJECT_ID_RE.test(id)) return next(ApiError.badRequest("Invalid task id"));
    next();
};
