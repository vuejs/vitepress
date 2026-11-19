# Print Layout

## Wide Table

| Option | Type | Default | Environment variable | Since | Applies to | Example value |
| --- | --- | --- | --- | --- | --- | --- |
| `--long-option-name` | `string` | `"default-value"` | `VITEPRESS_LONG_ENVIRONMENT_VARIABLE` | `1.0.0` | `build` | `https://example.com/a/very/long/path/that/should/wrap` |

## Long Code

```bash
curl --request POST --url https://example.com/api/v1/a/very/long/path/that/should/wrap/instead/of/being/clipped --header 'Authorization: Bearer example-token-with-a-long-value' --header 'Content-Type: application/json' --data '{"key":"value","another_key":"another value that makes this line long enough to overflow the printed page"}'
```
