import {Admin, AuthCallback, ListGuesser, Resource} from 'react-admin';
import postgrestRestProvider from "@promitheus/ra-data-postgrest";
import {Auth0AuthProvider, httpClient} from 'ra-auth-auth0';
import {Auth0Client} from '@auth0/auth0-spa-js';
import {BrowserRouter} from "react-router-dom";

const auth0 = new Auth0Client({
    domain: process.env.auth0Domain!,
    clientId: process.env.auth0ClientId!,
    cacheLocation: 'localstorage',
    authorizationParams: {
        audience: process.env.auth0Audience,
    },
});

const authProvider = Auth0AuthProvider(auth0, {});
const dataProvider = postgrestRestProvider("/api/admin", httpClient(auth0));

export default function EyeAdmin() {
    return (
        <BrowserRouter>
            <Admin loginPage={false} disableTelemetry requireAuth authProvider={authProvider}
                   dataProvider={dataProvider} authCallbackPage={AuthCallback}>
                <Resource name="domains" list={ListGuesser}/>
            </Admin>
        </BrowserRouter>
    )
}