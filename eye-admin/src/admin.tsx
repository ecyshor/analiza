import {Admin, AuthCallback, Resource} from 'react-admin';
import postgrestRestProvider from "@promitheus/ra-data-postgrest";
import {Auth0AuthProvider, httpClient} from 'ra-auth-auth0';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {BrowserRouter} from "react-router-dom";
import {DomainCreate, DomainList} from './domains';
import {useEffect, useState} from "react";

const auth0 = new Auth0Client({
    domain: process.env.REACT_APP_AUTH0_DOMAIN!,
    clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
    useRefreshTokensFallback: false,
    authorizationParams: {
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    },
});

const authProvider = Auth0AuthProvider(auth0, {});
const dataProvider = postgrestRestProvider(process.env.REACT_APP_POSTGREST_URL, httpClient(auth0));

export default function EyeAdmin() {
    const [tenantId, setTenantId] = useState('')
    useEffect(() => {
        async function getId() {
            const idToken = await auth0.getIdTokenClaims()
            if (idToken)
                setTenantId(idToken!["https://analiza.dev/user"])
        }

        getId()
    }, [])
    return (
        <BrowserRouter>
            <Admin disableTelemetry requireAuth authProvider={authProvider}
                   dataProvider={dataProvider} authCallbackPage={AuthCallback}>
                <Resource name="domains" list={DomainList} create={() => DomainCreate({tenantId})}/>
            </Admin>
        </BrowserRouter>
    )
}