# SAML Authenticator for Multiple SP's & Multiple IDP's

## Steps

1.- Create a spOptions (Service Provider Options) to create Service Provider:

```javascript
// Create service provider for any entity
const spOptions = {
  entity_id: `http://${domain}/${entity}/metadata.xml`,
  private_key: privateKey.export({ type: "pkcs1", format: "pem" }),
  certificate: publicKey.export({ type: "pkcs1", format: "pem" }),
  assert_endpoint: `http://${domain}/${entity}/assert`,
  allow_unencrypted_assertion: true,
};
const sp = new saml2.ServiceProvider(spOptions);
```

2.- Create a idpOptions (Identity Provider Options) to setup the Identity Provider

```javascript
// Create identity provider
const idpOptions = {
  sso_login_url: "{{login_url}}",
  sso_logout_url: "{{logout_url}}",
  // Request idp certificate and setup it at the next line.
  certificates: [fs.readFileSync("certificate-idp.pem").toString()],
};
const idp = new saml2.IdentityProvider(idpOptions);
```

3.- Create 3 endpoints to receive the request from node application and identity provider

```javascript
// Endpoint to retrieve metadata for Azure
app.get(`${enity}/metadata.xml`, function (req, res) {
  res.type("application/xml");
  res.send(sp_azure.create_metadata());
});

// Starting point for login
app.get(`${enity}/login`, function (req, res) {
  sp_azure.create_login_request_url(idp_azure,{}, function (err, login_url, request_id) {
      if (err != null) return res.send(500);
      res.redirect(login_url);
    }
  );
});

// Assert endpoint for when login completes
app.post(`${enity}/assert`, function (req, res) {
  sp_azure.post_assert(idp_azure, { request_body: req.body }, function (err, saml_response) {
      if (err != null) {
        return res.sendStatus(500);
      }
      console.log({ saml_response });
      // Sign JWT token & return
      res.redirect(`${CLIENT_URL}?token=token`);
    }
  );
});
```
