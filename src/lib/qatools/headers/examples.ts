export const exampleRequestHeaders = `GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0
Accept: application/json
Accept-Language: en-US,en;q=0.9
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Origin: https://example.com
Referer: https://example.com/dashboard
Cookie: session_id=abc123; theme=dark`;

export const exampleResponseHeaders = `HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234
Cache-Control: public, max-age=3600
ETag: "abc123"
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Credentials: true
Vary: Origin
Set-Cookie: session_id=xyz789; HttpOnly; Secure; SameSite=Strict
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains`;

export const exampleCorsError = `HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true`;

export const exampleCookieIssue = `HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session_token=abc123; SameSite=None
Set-Cookie: auth_token=xyz789; HttpOnly`;

