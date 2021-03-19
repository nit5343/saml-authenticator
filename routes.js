const fs = require('fs')
const crypto = require('crypto')
const saml2 = require('saml2-js')
const express = require('express');

const router = express.Router();

const configurations = [
    {
        organisationCode: "org2",
        idpOptions: {
            sso_login_url: " https://justintegrated.com/",
            sso_logout_url: " https://justintegrated.com/",
            certificates: [fs.readFileSync('justintegrated-idp.crt.pem').toString()]
        },
    },
    {
        organisationCode: "org1",
        idpOptions: {
            sso_login_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            sso_logout_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            certificates: [fs.readFileSync('azure-idp.crt.pem').toString()]
        },
    },
]

function getConfigurations(ms) {
    console.log("Trying to get Configurations")
    return new Promise(resolve => setTimeout(() => {
        console.log("Updating Mock Configuration")
        resolve(configurations)
    }, ms));
}

const init = async () => {
    // Use a promise : Added a delay of 5 seconds. In fact you should fetch the details from cache or DB
    const configs = await getConfigurations(5000);
    configs.forEach(config => {

        const { organisationCode, idpOptions } = config;

        const spOptions = {
            private_key: fs.readFileSync('domain-key.pem'),
            certificate: fs.readFileSync('domain-crt.pem'),
            entity_id: `http://localhost:5000/${organisationCode}/metadata.xml`,
            assert_endpoint: `http://localhost:5000/${organisationCode}/assert`,
            allow_unencrypted_assertion: true
        }
        const sp = new saml2.ServiceProvider(spOptions);
        const idp = new saml2.IdentityProvider(idpOptions);

        // Get Metadata
        router.get(`/${organisationCode}/metadata.xml`, (req, res) => {
            res.type('application/xml');
            res.send(sp.create_metadata());
        })

        // Login
        router.get(`/${organisationCode}/login`, (req, res) => {
            sp.create_login_request_url(idp, {}, function (err, login_url) {
                if (err != null) {
                    return res.send(500);
                }
                res.redirect(login_url);
            });
        })

        // Assert
        router.post(`/${organisationCode}/assert`, (req, res) => {
            console.log("I am asserting", req.body)
            sp.post_assert(idp, { request_body: req.body }, function (err, saml_response) {
                console.log({ err })
                if (err != null) {
                    return res.send(500);
                }
                console.log({ saml_response });
                // Sign JWT token & return
                const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"
                res.redirect(`${CLIENT_URL}?token=token`);
            });
        })
    })
};

init();

module.exports = router