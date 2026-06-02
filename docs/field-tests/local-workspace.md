# Local Field Test Workspace

Do not clone external project source code into this repository.

Use this local workspace for public or authorized project checkouts:

```text
/Users/daqiu/Documents/ai-codebase-doctor-field-tests
```

Create it with:

```bash
mkdir -p /Users/daqiu/Documents/ai-codebase-doctor-field-tests
cd /Users/daqiu/Documents/ai-codebase-doctor-field-tests
```

External repositories cloned into that directory are local working copies only. They should not be committed to `ai-codebase-doctor`.

Generated scan reports should stay outside this repository or in ignored `reports/` folders. Do not commit external code, generated reports, secrets, `.env` files, `.npmrc`, `node_modules/`, or build output.

