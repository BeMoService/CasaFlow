# CasaFlow API – Mock Functions (v0.1)

## createGenerationMock
**Type:** HTTPS Callable (Firebase Functions)

### Request
```json
{
  "propertyId": "string (verplicht)",
  "prompt": "string (optioneel)",
  "variants": 1,
  "idempotencyKey": "string (optioneel)"
}
