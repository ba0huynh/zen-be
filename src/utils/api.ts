type METHOD = "GET" | "POST" | "PUT" | "DELETE";
type ARGS = { body?: any, method: METHOD };
async function fetchApi(url: string, { body, method }: ARGS) {
    console.log("===================================================================")
    console.log(JSON.stringify({url, method, body}));
    console.log("===================================================================")
    
    const response = await fetch(url, {
        method,
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response;
}

async function fetchJson(url: string, args: ARGS) {
    const data = await fetchApi(url, args);
    return await data.json();
}

const api = {
    fetchJson,
    fetch: fetchApi,
} as const
export default api;
