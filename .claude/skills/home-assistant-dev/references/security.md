# Home Assistant Security & Best Practices

## API Token Management

### Token Types

| Type | Use Case | Expiration |
|------|----------|------------|
| **Long-Lived Access Token** | Scripts, integrations, CLI | Never (until revoked) |
| **Refresh Token** | Web/mobile apps | With session |
| **Temporary Token** | Single operations | Minutes to hours |

### Token Generation

1. Go to **Settings > People > Your Profile**
2. Scroll to **Long-Lived Access Tokens**
3. Click **Create Token**
4. Give it a descriptive name (e.g., "CLI Access", "Script X")
5. **Copy immediately** - shown only once!

### Secure Storage Methods

#### 1. Environment Variables (Recommended for CLI)

```bash
# ~/.bashrc, ~/.zshrc, or ~/.bash_profile
export HASS_SERVER="https://homeassistant.local:8123"
export HASS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Load without restart
source ~/.bashrc
```

Security:
- ✅ Not in version control
- ✅ Process-specific
- ⚠️ Visible in `env` / `ps`
- ⚠️ Stored in shell history if set inline

#### 2. Secure Token File

```python
# ~/.hass_token (chmod 600)
import os
from pathlib import Path

def load_token(filepath: str = "~/.hass_token") -> str:
    """Load token from secure file."""
    path = Path(filepath).expanduser()

    # Check permissions
    mode = path.stat().st_mode
    if mode & 0o077:
        raise PermissionError(
            f"Token file {path} has permissions {oct(mode)}. "
            "Run: chmod 600 {path}"
        )

    return path.read_text().strip()

# Setup
# echo "your-token" > ~/.hass_token
# chmod 600 ~/.hass_token
```

#### 3. System Keyring (Most Secure for Desktop)

```python
import keyring

# Store
keyring.set_password("homeassistant", "api_token", "your-token")

# Retrieve
token = keyring.get_password("homeassistant", "api_token")

# Install: pip install keyring
```

#### 4. Secrets Manager (Production)

**HashiCorp Vault:**
```python
import hvac

client = hvac.Client(url='https://vault.example.com')
client.auth.approle_login(role_id='...', secret_id='...')

secret = client.secrets.kv.v2.read_secret_version(
    path='homeassistant/api_token'
)
token = secret['data']['data']['token']
```

**AWS Secrets Manager:**
```python
import boto3
from botocore.exceptions import ClientError

def get_secret():
    client = boto3.client('secretsmanager')
    try:
        response = client.get_secret_value(SecretId='homeassistant/api')
        return response['SecretString']
    except ClientError as e:
        raise e
```

### Token Rotation Policy

```python
import datetime
from dataclasses import dataclass

@dataclass
class TokenManager:
    """Manage HA token lifecycle."""

    token: str
    created_at: datetime.datetime
    max_age_days: int = 90

    def is_expiring_soon(self, warning_days: int = 7) -> bool:
        """Check if token needs rotation."""
        age = datetime.datetime.now() - self.created_at
        return age.days > (self.max_age_days - warning_days)

    def should_rotate(self) -> bool:
        """Check if token must be rotated."""
        age = datetime.datetime.now() - self.created_at
        return age.days > self.max_age_days

# Rotation workflow
# 1. Generate new token in HA UI
# 2. Update secure storage
# 3. Test new token
# 4. Revoke old token in HA UI
# 5. Update rotation log
```

## Network Security

### HTTPS Configuration

**Required for production!**

```yaml
# configuration.yaml
http:
  ssl_certificate: /ssl/fullchain.pem
  ssl_key: /ssl/privkey.pem
```

Let's Encrypt (Home Assistant OS):
- Install **Let's Encrypt** add-on
- Configure domain and email
- Auto-renewal included

Manual certificate:
```bash
# Copy to HA
scp cert.pem key.pem root@homeassistant.local:/ssl/

# Restart HA
ssh root@homeassistant.local "ha core restart"
```

### API Security Checklist

- [ ] HTTPS enabled
- [ ] Token never logged
- [ ] Token rotated every 90 days
- [ ] Separate tokens per integration
- [ ] Tokens revoked when not needed
- [ ] IP filtering (if possible)
- [ ] Failed auth monitoring

## Development Best Practices

### Configuration Validation

```python
import requests

def safe_api_call(func):
    """Decorator for safe API calls."""
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise AuthenticationError("Invalid token")
            raise
        except requests.exceptions.ConnectionError:
            raise ConnectionError("Cannot connect to HA")
    return wrapper

@safe_api_call
def get_state(server: str, token: str, entity_id: str):
    """Get entity state safely."""
    resp = requests.get(
        f"{server}/api/states/{entity_id}",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10
    )
    resp.raise_for_status()
    return resp.json()
```

### Retry Logic

```python
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_secure_session(token: str) -> requests.Session:
    """Create session with retry logic."""
    session = requests.Session()

    # Retry strategy
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[502, 503, 504],
        allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE"]
    )

    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    # Headers
    session.headers.update({
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    })

    return session
```

### Error Handling

```python
class HAError(Exception):
    """Base Home Assistant error."""
    pass

class AuthenticationError(HAError):
    """Invalid credentials."""
    pass

class ConnectionError(HAError):
    """Cannot connect."""
    pass

class ServiceNotFound(HAError):
    """Service/domain not found."""
    pass

def handle_api_error(response):
    """Handle API errors appropriately."""
    status = response.status_code

    if status == 401:
        raise AuthenticationError("Invalid or expired token")
    elif status == 404:
        raise ServiceNotFound(f"Entity not found: {response.url}")
    elif status >= 500:
        raise ConnectionError(f"Server error: {status}")
    else:
        response.raise_for_status()
```

## Common Pitfalls

### ❌ Don't

```python
# Hardcoded token in code
token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."  # DON'T!

# No timeout
requests.get(url)  # Blocks forever!

# Ignoring SSL
requests.get(url, verify=False)  # Insecure!

# Storing in plain text file without permissions
with open("token.txt") as f:  # World readable!
    token = f.read()
```

### ✅ Do

```python
# Environment variable
import os
token = os.environ["HASS_TOKEN"]

# Always use timeout
requests.get(url, timeout=10)

# Verify SSL certificates
requests.get(url, verify=True)

# Secure file with permissions
# chmod 600 ~/.hass_token
```

## Monitoring & Auditing

### Log Format

```python
import logging
import json

class SensitiveDataFilter(logging.Filter):
    """Remove sensitive data from logs."""

    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = record.msg.replace(self.token, "***REDACTED***")
        return True

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

logger = logging.getLogger("homeassistant")
logger.addFilter(SensitiveDataFilter())
```

### Failed Auth Detection

```python
import time
from collections import defaultdict

class AuthMonitor:
    """Monitor for suspicious activity."""

    def __init__(self, max_attempts: int = 5, window_seconds: int = 60):
        self.attempts = defaultdict(list)
        self.max_attempts = max_attempts
        self.window = window_seconds

    def record_attempt(self, ip: str, success: bool):
        """Record authentication attempt."""
        now = time.time()
        self.attempts[ip].append((now, success))

        # Clean old attempts
        cutoff = now - self.window
        self.attempts[ip] = [
            (t, s) for t, s in self.attempts[ip] if t > cutoff
        ]

        # Check for brute force
        failures = sum(1 for _, s in self.attempts[ip] if not s)
        if failures > self.max_attempts:
            self._alert(f"Possible brute force from {ip}")

    def _alert(self, message: str):
        """Send alert."""
        logger.warning(f"SECURITY ALERT: {message}")
```

## Integration Security

### Custom Component Guidelines

```python
# Never store credentials in plain text
# config_flow.py

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_TOKEN

class ConfigFlow(config_entries.ConfigFlow, domain="my_integration"):
    async def async_step_user(self, user_input=None):
        if user_input is not None:
            # Validate token without storing
            try:
                await validate_token(
                    user_input[CONF_HOST],
                    user_input[CONF_TOKEN]
                )
            except InvalidAuth:
                return self.async_show_form(
                    step_id="user",
                    errors={"base": "invalid_auth"}
                )

            return self.async_create_entry(
                title=user_input[CONF_HOST],
                data=user_input  # Encrypted by HA
            )
```

### Secret Usage in YAML

```yaml
# configuration.yaml
rest:
  - resource: https://api.example.com
    headers:
      Authorization: !secret api_token

# secrets.yaml
api_token: "Bearer eyJ0eXAiOiJKV1Qi..."
```

**Never commit `secrets.yaml`!** Add to `.gitignore`.

## Security Resources

- [Home Assistant Security Documentation](https://www.home-assistant.io/docs/security/)
- [App Security Guidelines](https://developers.home-assistant.io/docs/apps/security)
- [Secrets Management](https://www.home-assistant.io/docs/configuration/secrets/)
