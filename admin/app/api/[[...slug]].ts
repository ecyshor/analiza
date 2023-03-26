export default async function handler(req: any, res: any) {
    // get the incoming request URL, e.g. 'posts?limit=10&offset=0&order=id.asc'
    const requestUrl = req.url.substring("/api/admin/".length);
    // build the CRUD request based on the incoming request
    const url = `${process.env.POSTGREST_URL}/rest/v1/${requestUrl}`;
    const options: any = {
        method: req.method,
        headers: req.headers,
    };
    if (req.body) {
        options.body = JSON.stringify(req.body);
    }
    // call the CRUD API
    const response = await fetch(url, options);
    // send the response back to the client
    res.setHeader("Content-Range", response.headers.get("content-range"));
    res.end(await response.text());
}