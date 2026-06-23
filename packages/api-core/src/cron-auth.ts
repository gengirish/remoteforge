export function authorizeCron(
  authHeader: string | undefined,
  cronSecretHeader: string | undefined,
  cronSecret: string | undefined,
): boolean {
  const token =
    authHeader?.replace(/^Bearer\s+/i, "") ?? cronSecretHeader ?? undefined;
  return Boolean(token && cronSecret && token === cronSecret);
}
