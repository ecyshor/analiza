import {Admin, AuthCallback, CustomRoutes, Menu, Resource} from 'react-admin';
import postgrestRestProvider from "@promitheus/ra-data-postgrest";
import {Auth0AuthProvider, httpClient} from 'ra-auth-auth0';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {BrowserRouter, Route} from "react-router-dom";
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
    const Setup = <div
        dangerouslySetInnerHTML={{__html: `<script src="https://cdn.jsdelivr.net/gh/ecyshor/analiza@main/tracker/analiza.min.js" tenant="${tenantId}"></script>`}}></div>
    return (
        <BrowserRouter>
            <Admin menu={CustomMenu} disableTelemetry requireAuth authProvider={authProvider}
                   dataProvider={dataProvider}
                   authCallbackPage={AuthCallback}>
                <CustomRoutes>
                    <Route path="/data" element={<iframe
                        title={"Analytics"}
                        src={"https://metabase.analiza.dev/embed/dashboard/" + metabaseToken + "#bordered=true&titled=true"}
                        frameBorder={0}
                        width={"100%"}
                        height={"100%"}
                        allowTransparency
                    />}/>
                </CustomRoutes>
                <Resource name="domains" list={DomainList} create={() => DomainCreate({tenantId})} children={Setup}/>
            </Admin>
        </BrowserRouter>
    )
}
const CustomMenu = () => <Menu>
    <Menu.DashboardItem/>
    <Menu.Item to="/data" primaryText="Data"/>
    <Menu.ResourceItem name="domains"/>
</Menu>
