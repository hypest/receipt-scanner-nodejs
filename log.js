export function log(message) {
  // Complete a structured log entry.
  const entry = Object.assign(
    {
      severity: "NOTICE",
      message:
        typeof message === "object" && message !== null
          ? JSON.stringify(message, null, 2)
          : message,
      // Log viewer accesses 'component' as 'jsonPayload.component'.
      component: "arbitrary-property",
    },
    {}
  );

  // Serialize to a JSON string and output.
  console.log(JSON.stringify(entry));
}
