export const example401MissingAuth = `Request Headers:
GET /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json

Response Headers:
HTTP/1.1 401 Unauthorized
Content-Type: application/json
WWW-Authenticate: Bearer realm="api"`;

export const example401ExpiredToken = `Request Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE1MTYyMzkwMjJ9.signature

Response Headers:
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer error="invalid_token", error_description="Token expired"`;

export const example403InsufficientPermissions = `Request Headers:
Authorization: Bearer valid_token_here
Cookie: session=abc123

Response Headers:
HTTP/1.1 403 Forbidden
Content-Type: application/json`;

export const exampleCorsIssue = `Request Headers:
Origin: https://app.example.com
Authorization: Bearer token123

Response Headers:
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
Set-Cookie: session=abc; SameSite=None; Path=/`;

export const exampleCookieIssues = `Request Headers:
Cookie: session=abc123

Response Headers:
HTTP/1.1 200 OK
Set-Cookie: session=new_session; SameSite=None; Path=/
Set-Cookie: csrf=token; Secure; HttpOnly`;

