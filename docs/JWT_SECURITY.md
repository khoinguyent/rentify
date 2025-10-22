# JWT Security Best Practices

## Configuration

### Environment Variables

```bash
# JWT Secret (NEVER rotate on schedule, only if compromised)
JWT_SECRET="your-long-random-secret-here-minimum-32-characters"

# Token Expiration (how long each token is valid)
JWT_EXPIRATION="7d"  # or "1h", "24h", "30d", etc.

# Refresh Token Expiration (for refresh token pattern)
JWT_REFRESH_EXPIRATION="30d"
```

## Token Expiration Guidelines

### Access Token Expiration

**Short-lived (Recommended for high security):**
- 15 minutes to 1 hour
- Requires refresh token implementation
- Better security, more frequent re-validation

**Medium-lived (Current setup):**
- 1 day to 7 days
- Good balance for most SaaS applications
- Users re-authenticate weekly

**Long-lived (Not recommended):**
- 30+ days
- Convenient but less secure
- Higher risk if token is compromised

### Current Configuration

```typescript
// apps/api/src/auth/auth.module.ts
JwtModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    secret: config.get('JWT_SECRET'),  // Stays the same
    signOptions: {
      expiresIn: config.get('JWT_EXPIRATION') || '7d',  // Token lifetime
    },
  }),
})
```

## Production Security Checklist

### ✅ Must Do

1. **Use Strong Secret**
   ```bash
   # Generate with:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Store Secret Securely**
   - Use environment variables
   - Never commit to Git
   - Use secret management (AWS Secrets Manager, HashiCorp Vault, etc.)

3. **Use HTTPS Only**
   - Tokens transmitted over secure connection
   - Set secure cookie flags

4. **Set Appropriate Expiration**
   - Balance security vs. UX
   - Consider your application's sensitivity

5. **Implement Token Refresh** (Optional but recommended)
   - Short-lived access tokens (15min - 1h)
   - Longer-lived refresh tokens (7d - 30d)
   - Refresh tokens can be revoked

### ⚠️ When to Rotate JWT_SECRET

**Only rotate the JWT_SECRET if:**

1. **Security Breach**
   - Secret has been exposed
   - Unauthorized access detected
   - Employee with access has left

2. **Compliance Requirements**
   - Some regulations require periodic rotation
   - Document your rotation policy

3. **Scheduled Security Audit**
   - Annual or bi-annual rotation as policy
   - Not required but can be part of security posture

**Rotation Impact:**
- ❌ All existing tokens become invalid
- ❌ All users must re-authenticate
- ⚠️ Plan for user communication
- ⚠️ Consider gradual rotation with multiple secrets

## Implementing Refresh Tokens (Recommended)

For better security, implement a refresh token pattern:

### Benefits
- Short-lived access tokens (15min - 1h)
- Refresh tokens can be revoked
- Better security without constant re-authentication

### Implementation Strategy

```typescript
// Example: Enhanced token strategy
export class AuthService {
  async login(user: any) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' }  // Short-lived
    );
    
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }  // Longer-lived
    );
    
    // Store refresh token in database for revocation
    await this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }
  
  async refresh(refreshToken: string) {
    // Verify refresh token
    // Issue new access token
    // Optionally rotate refresh token
  }
}
```

## Monitoring & Best Practices

### Track Token Usage

```typescript
// Log suspicious activity
- Multiple failed authentication attempts
- Tokens used from different IP addresses
- Unusual access patterns
```

### Rate Limiting

```typescript
// Implement rate limiting on auth endpoints
@UseGuards(ThrottlerGuard)
@Post('login')
async login() { ... }
```

### Token Revocation

For critical applications, implement token blacklist or whitelist:

```typescript
// Store active tokens in Redis
// Check on each request
// Revoke on logout or security event
```

## Example Production Configuration

```bash
# .env.production

# Access Token (short-lived)
JWT_SECRET="a1b2c3d4...64-characters-minimum"
JWT_EXPIRATION="1h"

# Refresh Token (longer-lived, stored in DB)
JWT_REFRESH_SECRET="x9y8z7w6...different-64-char-secret"
JWT_REFRESH_EXPIRATION="7d"

# Security
CORS_ORIGIN="https://yourdomain.com"
NODE_ENV="production"
```

## Summary

| Setting | Purpose | Rotation Schedule |
|---------|---------|-------------------|
| `JWT_SECRET` | Signs/verifies tokens | Only if compromised |
| `JWT_EXPIRATION` | Token lifetime | Configure once, adjust as needed |
| Access Tokens | User authentication | Auto-expire per JWT_EXPIRATION |
| Refresh Tokens | Renew access | Can be revoked individually |

## Common Mistakes to Avoid

❌ **Don't:** Rotate JWT_SECRET on a schedule
✅ **Do:** Set it once with strong randomness

❌ **Don't:** Use short, predictable secrets
✅ **Do:** Use 256+ bit random strings

❌ **Don't:** Store JWT_SECRET in code
✅ **Do:** Use environment variables / secret managers

❌ **Don't:** Make tokens live forever
✅ **Do:** Set reasonable expiration times

❌ **Don't:** Ignore token revocation needs
✅ **Do:** Implement refresh tokens for critical apps

## Further Reading

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 Token Best Practices](https://auth0.com/docs/secure/tokens/token-best-practices)

