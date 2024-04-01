import { Auth0Client } from '@auth0/auth0-spa-js';
import postgrestRestProvider from "@promitheus/ra-data-postgrest";
import { Auth0AuthProvider, httpClient } from 'ra-auth-auth0';
import { useEffect, useState } from "react";
import { Admin, AuthCallback, CustomRoutes, Resource } from 'react-admin';
import { Route } from "react-router-dom";
import { DomainCreate, DomainList } from './domains';
import { AdminCustomLayout } from './layout';

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
const metabaseUrl = process.env.REACT_APP_METABASE_URL

export default function EyeAdmin() {
    const [tenantId, setTenantId] = useState('')
    const [metabaseToken, setMetabaseToken] = useState('')
    useEffect(() => {
        async function getId() {
            const idToken = await auth0.getIdTokenClaims()
            if (idToken) {
                setTenantId(idToken!["https://analiza.dev/user"])
                setMetabaseToken(idToken!["metabase/jwt"])
            }
        }

        getId()
    }, [])
    return (
        // used to have real links and not #parts in the browser
        <Admin layout={AdminCustomLayout} disableTelemetry requireAuth authProvider={authProvider}
            dataProvider={dataProvider}
            authCallbackPage={AuthCallback}>
            <CustomRoutes>
                <Route path="/" element={<iframe
                    title={"Analytics"}
                    src={`${metabaseUrl}/embed/dashboard/` + metabaseToken + "#bordered=true&titled=true"}
                    frameBorder={0}
                    width={"100%"}
                    height={"100%"}
                    allowTransparency
                />} />
            </CustomRoutes>
            <Resource name="domains" list={DomainList({ tenantId })} create={() => DomainCreate({ tenantId })} />
        </Admin>
    )
}