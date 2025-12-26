export const exampleSameSiteNoneNoSecure = `Set-Cookie: session=abc123; SameSite=None; Path=/`;

export const exampleCrossSiteBlocked = `Set-Cookie: auth_token=xyz789; SameSite=Lax; Secure; HttpOnly; Path=/`;

export const exampleValidSession = `Set-Cookie: session_id=def456; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`;

export const exampleDomainMismatch = `Set-Cookie: api_token=ghi789; Domain=api.example.com; Secure; HttpOnly; Path=/`;

export const exampleMultipleCookies = `Set-Cookie: session=abc123; Secure; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600
Set-Cookie: theme=dark; Path=/; Max-Age=31536000
Set-Cookie: csrf=token123; Secure; SameSite=Strict; Path=/`;

export const exampleCookieHeader = `Cookie: session=abc123; theme=dark; csrf=token123`;

