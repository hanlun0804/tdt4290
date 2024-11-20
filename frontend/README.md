The frontent part of the application is for demonstration purposes only.

## Start frontend

Optional: Make sure backend and whisper is running. Follow steps in /backend/README.md & /whisper/README.md.
Alternatively: use startup script from the main README.md 

1. Navigate to /frontend/
2. run command: `npm install`
3. run command: `npm run dev`

## Structure

The frontend has three different *areas*:
- Userland: where you can create data for the database
- Cheque client: where you can browse the data
- Baffel: where you can interract with the voicebot

Each of these areas have a set of pages and components. These can be found in `src/components/*area*/` and `src/components/*area*/`. Should any component (or page) be used in multiple areas, define them in the components/pages folder. 

In `src/main.tsx` you will find the paths between pages. `src/App.tsx` defines the landing page. 

## Communication

This section will also cover communication from the other modules, but it is best to keep it all in one place. 

### Initiate communication from frontend to backend

The frontend uses [tanstack query](https://tanstack.com/query/latest/docs/framework/react/overview) to take care of the hard parts of async requests. We use it in a frontend component like this:

```typescript
const { data } = useQuery({
    queryKey: ["data"],
    queryFn: getData,
})
```

Read the documentation for more information about this library. In short:
- `const { data }` is the result of the query. `data` will be undefined until you get a response.  
- `queryKey: ["data"]` is a keyword to make caching work. If you make the same query somewhere else in the application, and use the same keyword, tanstack query will use cached data instead of fetching it again.
- `queryFn: getData` is the actual async function that requests the data.

You can define the async function (like "getData") separately, or directly in the queryFn field. The following is a simple example:

```typescript
export const getData = async () => {
  const res = await fetch(`${endpoint}/data`)
  return await res.json()
}
```

`endpoint` is the URL (or URI) where the backend is running. For development, we use `http://localhost:3000`.

### Response from backend to frontend

After having sent a request to some endpoint, we have to make sure that it reaches an existing enpoint in the backend. 
We make define these endpoints in `backend/src/index.ts`, and they can look like this:

```typescript
app.get('/data', async (req: Request, res: Response) => {
  const db = await database
  const data = await db.exec("SQL goes here")
  return res.json(data)
})
```

The only thing to note here is that the path (`/data`) must match the path defined in the async function on the frontend. Parameters can be defined like this: `/data/:id` if you want to query for a specific item. Request headers can also be extracted from the req object (see examples in index.ts).

### Initiate communication from backend to voicebot

Communication between backend and voicebot is very similar to communication between frontend and backend. The only major difference is that the voicebot uses [FastAPI](https://fastapi.tiangolo.com/) (python), instead of tanstack query / express (typescript).

Since the backend does not send requests on its own, they must instead be inside an endpoint. This is as simple as replacing the database call (in the codeblock above) with an async function hitting the endpoint of the voicebot api. It can look like this:

```typescript
app.get("/test-voicebot", async (req: Request, res: Response) => {
    
    const result = await fetch(`${voicebot_endpoint}/process-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(...some data here...)
    });
    const data = await result.json()
    console.log("final result:", data)
    res.json(data)
})
```

This example shows how to add a body to the request. `voicebot_endpoint` is similar to the backend endpoint: just the URL where the api is running. In our case it is `http://localhost:8000`.

### Response from voicebot to backend

The voicebot api is responsible for receiving requests, and passing them on to the manager (`whisper/Manager.py`). This is the class where all the complicated voicebot logic is written. We don't need to worry about that now, because the api is simply putting the manager to work, and returning the result to the server. The code is defined in `whisper/api.py`, and it may look like this:

```python
@app.post("/process-data")
async def process_customer(data):
    res = manager.process_data(data)
    return JSONResponse(status_code=201, content=res)
```

Again, the only thing to note is that the path ("/process-data") matches the path of the async function defined in the server. 