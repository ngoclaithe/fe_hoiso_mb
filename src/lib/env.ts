export const env = {
  URL_BACKEND: process.env.URL_BACKEND || "",
  NEXT_PUBLIC_URL_BACKEND: process.env.NEXT_PUBLIC_URL_BACKEND || "",
};

export function requireEnv<K extends keyof typeof env>(key: K): string {
  const v = env[key];
  if (!v) throw new Error(`Thiếu ${key}`);
  return v;
}
