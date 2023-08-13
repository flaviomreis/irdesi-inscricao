import { headers } from "next/headers";

export function buildUrl(endpoint: string): string {
  const protocol = headers().get("x-forwarded-proto");
  const host = headers().get("x-forwarded-host");
  const url = `${protocol}://${host}/${endpoint}`;
  return url;
}
