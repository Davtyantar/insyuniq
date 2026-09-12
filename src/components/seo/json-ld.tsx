/**
 * `<` is escaped so a listing title/description containing "</script>" (or
 * any other tag) can't prematurely close this script and corrupt the page —
 * JSON.stringify alone does not escape it. Safe for JSON: `<` never appears
 * unescaped inside a valid JSON string.
 */
function toSafeJson(value: object): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/** Renders one or more schema.org objects as inline JSON-LD script tags. */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-danger
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toSafeJson(item) }}
        />
      ))}
    </>
  );
}
