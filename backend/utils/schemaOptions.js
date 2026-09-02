// Shared schema-level output hardening: never let internal Mongoose fields (or, on
// User specifically, the password hash) leak into JSON responses, even if a future
// query accidentally selects them. This is defense in depth on top of `select: false`
// and the explicit field-picking already done in controllers.
export function baseToJSON(extraStrip = []) {
  return {
    virtuals: false,
    versionKey: false,
    transform(_doc, ret) {
      delete ret.__v;
      extraStrip.forEach((field) => delete ret[field]);
      return ret;
    },
  };
}
