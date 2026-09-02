import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Sets a conservative set of security-related HTTP response headers (CSP, no-sniff,
// frameguard, HSTS on HTTPS, etc.). The API serves JSON only, so a strict default-src
// 'none' CSP is safe and removes an entire class of XSS/data-injection concerns that
// would otherwise apply if this API ever served any HTML.
export const secureHeaders = helmet({
  contentSecurityPolicy: {
    directives: { defaultSrc: ["'none'"] },
  },
  crossOriginResourcePolicy: { policy: "same-site" },
});

// General API rate limit: blunt protection against basic abuse/DoS across all routes.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

// Tighter limit specifically on auth endpoints, since these are the classic target for
// credential-stuffing and brute-force attacks. Keyed by IP; combined with the
// account-level lockout in authController for defense in depth.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

// Strips any key starting with "$" or containing "." from req.body/query/params,
// closing off NoSQL injection via payloads like { "phone": { "$gt": "" } } that would
// otherwise let an attacker manipulate a Mongo query's operators.
export const sanitizeMongo = mongoSanitize({
  onSanitize: ({ key }) => {
    console.warn(`[security] Sanitized a potentially malicious key: ${key}`);
  },
});

// Guards against HTTP Parameter Pollution (e.g. ?category=a&category=b being used to
// smuggle an array where a single scalar value is expected).
export const preventParamPollution = hpp();
