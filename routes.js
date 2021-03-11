const crypto = require('crypto')
const saml2 = require('saml2-js')
const express = require('express');

const router = express.Router();

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })

const configurations = [
    {
        organisationCode: "org1",
        idpOptions: {
            sso_login_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            sso_logout_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            certificates: [`
            -----BEGIN CERTIFICATE-----
            MIIC8DCCAdigAwIBAgIQHunWeRF1hIBO7+HacP/OazANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQD
            EylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMTAyMjMwNTI1
            NDBaFw0yNDAyMjMwNTI1NDBaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQg
            U1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA32uS9+fXZ5mX
            dgP8JShjr1Cc/YmGR3ojKmycfr7QURTJZAVv60LvepaCminLHB3AXkyfbxdfKjsw9LgQMZ0yGD0J
            lxi6H5A0FYT6pbCWOFoaLpPIbM2Nv8MpEM7qD7wf+Wa/31q5+NJyVgpR1bdMfxkrS0AKOIfHJCAF
            NbbuTPux4cldb7wClQ9ei0HeMA9r/Pu1O1sn7xyzIw0HMcge6MrIbCVcs5Te4aGb1rACTF/oKH8l
            gn9Z3imq6+YLhSImYE2yijhM4Lo6MlflTW8+FfA1ZSVpaD0rNOXQ/IPTiNLeIoXRXNyfvk+VAg3Q
            XBP2P361YOlCX56DnBNQMP+bwQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQDRjf1C56ceVHOBcRlk
            ZSDbxpmOttOCFof5ErOt4sSvfMyG6QFon/1+URwZitwmEpXx2Ki6tOow1UP/XZWGIumhgo0F7Da4
            KhBaf+VgWeuNhXGZ8fqXyQnQ/lmXn5HDA00ip3sbtXgPG3hW7LsdOtkXUvkCLOk1OJJwAUYiXKOf
            I2Eb9tCpc2Zu/PIT+NqN1Ox3QzlsrYGz8ksyp1tRuAsG+xJGGrEeV6eDgZncw64vUmrCdUNo28QU
            Smq+ZungvVn4COlZbzd11smVT99GnFnmoLrZWGntZ4gHV77Jts2qKSzZe3/7hRcB48WeSp/POOM9
            P9RjAdRLgDrdK4dSQM9v
            -----END CERTIFICATE-----
            `],
        },
    },
    {
        organisationCode: "org2",
        idpOptions: {
            sso_login_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            sso_logout_url: "https://login.microsoftonline.com/7bb620d5-949e-433e-af27-f9c0f08034ee/saml2",
            certificates: [`
            -----BEGIN CERTIFICATE-----
            MIIC8DCCAdigAwIBAgIQHunWeRF1hIBO7+HacP/OazANBgkqhkiG9w0BAQsFADA0MTIwMAYDVQQD
            EylNaWNyb3NvZnQgQXp1cmUgRmVkZXJhdGVkIFNTTyBDZXJ0aWZpY2F0ZTAeFw0yMTAyMjMwNTI1
            NDBaFw0yNDAyMjMwNTI1NDBaMDQxMjAwBgNVBAMTKU1pY3Jvc29mdCBBenVyZSBGZWRlcmF0ZWQg
            U1NPIENlcnRpZmljYXRlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA32uS9+fXZ5mX
            dgP8JShjr1Cc/YmGR3ojKmycfr7QURTJZAVv60LvepaCminLHB3AXkyfbxdfKjsw9LgQMZ0yGD0J
            lxi6H5A0FYT6pbCWOFoaLpPIbM2Nv8MpEM7qD7wf+Wa/31q5+NJyVgpR1bdMfxkrS0AKOIfHJCAF
            NbbuTPux4cldb7wClQ9ei0HeMA9r/Pu1O1sn7xyzIw0HMcge6MrIbCVcs5Te4aGb1rACTF/oKH8l
            gn9Z3imq6+YLhSImYE2yijhM4Lo6MlflTW8+FfA1ZSVpaD0rNOXQ/IPTiNLeIoXRXNyfvk+VAg3Q
            XBP2P361YOlCX56DnBNQMP+bwQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQDRjf1C56ceVHOBcRlk
            ZSDbxpmOttOCFof5ErOt4sSvfMyG6QFon/1+URwZitwmEpXx2Ki6tOow1UP/XZWGIumhgo0F7Da4
            KhBaf+VgWeuNhXGZ8fqXyQnQ/lmXn5HDA00ip3sbtXgPG3hW7LsdOtkXUvkCLOk1OJJwAUYiXKOf
            I2Eb9tCpc2Zu/PIT+NqN1Ox3QzlsrYGz8ksyp1tRuAsG+xJGGrEeV6eDgZncw64vUmrCdUNo28QU
            Smq+ZungvVn4COlZbzd11smVT99GnFnmoLrZWGntZ4gHV77Jts2qKSzZe3/7hRcB48WeSp/POOM9
            P9RjAdRLgDrdK4dSQM9v
            -----END CERTIFICATE-----
            `],
        },
    },

]

function getConfigurations(ms) {
    console.log("Trying to get Configurations")
    return new Promise(resolve => setTimeout(() => {
        console.log("Sending Configurations")
        resolve(configurations)
    }, ms));
}

const init = async () => {
    // Use a promise : Added a delay of 5 seconds. In fact you should fetch the details from cache or DB
    const configs = await getConfigurations(5000);
    configs.forEach(config => {

        const { organisationCode, idpOptions } = config;

        const spOptions = {
            private_key: privateKey.export({ type: 'pkcs1', format: 'pem' }),
            certificate: publicKey.export({ type: 'pkcs1', format: 'pem' }),
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
            sp.post_assert(idp, { request_body: req.body }, function (err, saml_response) {
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