# voyager-react

> The easiest way in the entire interstellar space, to consume a REST API. State management included.

[![NPM](https://img.shields.io/npm/v/voyager-react.svg)](https://www.npmjs.com/package/voyager-react) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Voyager aims to be to REST what Apollo Client is to GraphQL. In this spirit, Voyager also implements state management and maintains a local cache of the data. 

For example, after sending a POST request Voyager will automatically update any GET requests that should include the newly created entity. Similarly for PUT and DELETE requests.

## Installation

```bash
yarn add voyager-react
```

or

```bash
npm install --save voyager-react
```
## Usage

Wrap your application with the ```<VoyagerProvider>``` tag

```tsx
const Main = () => {
  return (
    <VoyagerProvider
      auth="http://localhost:3000/auth"
      url="http://localhost:3000/api/v1"
    >
      <App/>
   </VoyagerProvider>
  )
}
```
The auth URL must point to a very simple authentication server. Example server coming soon. This URL is used to obtain an API token using the login (see useLogin hook - coming soon). The token shell be used in each subsequent request to the API.

The URL attribute must point the the REST API. This is an (almost) standard REST (example server coming soon).

## API

### ```useGet<T=any>(resource: string, options?: Partial<RequestOptions>): [RequestState<T>, GetFunction<T>]```

This hook is used to generate a GET request. Filtering, sorting and pagination information will be appended as URL query parameters, using default values if not explicitly provided.

### Parms

|Name|Description|
|----|-----------|
|resource|The top level REST resource|
|options|An object of various options such as filtering, sorting and pagination but also related to the cache mechanism and request execution.|

#### RequestOptions

|Field|Type|Description|
|-----|----|-----------|
|query|Partial\<QueryParameters>||
|lazy|boolean|When set to true this will cause the request not to execute instantly, but rather be executed by calling ```GetFunction``` in code|
|policy|'cache-first', 'cache-and-network', 'network-first', 'no-cache'|```cache-first``` check in cache and if found do not do anything, if not found do network; ```cache-and-network``` check cache and then do network, regardless; ```netowrk-fist``` do network without checking cache, and cache the result; ```no-cahce``` do network and don`t cache result|
|strictSorting|boolean|When checking the cache Voyager will not allow entities obtained using a different ```sort_by``` option to mix.|
|spawnFromCache|boolean|When requesting a single entity by ID (for example endpoint ```/restaurants/123```) setting this option to true will allow Voyager to firstly search for the entity by ID in the local cache and if it exists skip crating an actual request|
|skipUntil|boolean|The request will not be created until this condition is true|

#### QueryParameters

|Field|Type|Description|
|-----|----|-----------|
|select|string[]|An array of the fields to be returned for each entity.|
|page_size|number|Number of entities per page.|
|page_no|number|The page number. Starts at 0.|
|sort_by|Sort|How to sort the entities in the database before in the response|
|filter|FilterObj|A set of constraints that the entities must meet in order to be part of the response|

#### Sort

[string, 'asc' | 'desc']

The first string must be a fiend available on the entities to be sorted. The second array items indicates the sorting order.

#### FilterObj

|Field|Type|Description|
|-----|----|-----------|
|[string]|Filter|The keys in a FilerObject are not standard. Each key must be a field on the entities being sorted|

#### Filter

[

  'eq' | 'neq' | 'regex' | 'in' | 'gt' | 'gte' | 'lt' | 'lte',

  string | number | null | Array<string | number | null>

]

A filter consists of an operation, on the first position and a right hand side operator on the second position. So, for example the following FilterObj will get all entries that have the type equal to "fast-food".

```
{
  type: ["eq", "fast-food"]
}
```

### Return Value

#### RequestState

|Field|Type|Description|
|-----|----|-----------|
|loading|boolean|Indicates weather the request is ongoing. If the request was not created yet (because of ```lazy``` option), then this will be ```false```|
|called|boolean|Indicates weather the request was created.|
|data|T|The actual data returned from the API|
|meta|Meta|Metadata about the data in the response|
|err|string|A string describing any possible error. Might be a networking error (such as the lack of connection) or a custom API error returned in ```message``` field of the body, with appropriate error HTTP status code.|

#### Meta

|Field|Type|Description|
|-----|----|-----------|
|total|number|The total number of entries that exist in the database for the given filtering|
|hasNext|boolean|Indicates weather there is a next page of data|
|hasPrev|boolean|Indicates weather there is a previous page of data|

#### GetFunction\<T> = (params?: GetFunctionParams) => Promise\<T>

#### GetFunctionParams

|Field|Type|Description|
|-----|----|-----------|
|silent?|boolean|Setting this to true will cause the ```loading``` property of ```RequestState``` to not indicate when the request is ongoing. This is useful for updating the UI without the user seeing a loading UI (if any implemented)|
|policy?|'cache-first', 'cache-and-network', 'network-first', 'no-cache'|Allows to override the policy specified by ```RequestOptions```. This is useful to force Voyager to fetch again cached data when it might have changed and there is no way for the cache mechanism to know this. Detailed use-case example coming soon.|


#### Example

```tsx
const Restaurants = () => {

  const [{loading, data, err}] = useGet("restaurants", {
    sort_by: ["rating", "desc"],
    query: {
      rating: ["gte", 4],
      location: ["in", ["Bucharest", "Iasi"]]
    }
  })

  if(loading) return null

  if(err) return <p>{err}</p>

  return (
    <div>
      {data.map(r => <RestaurantItem data={r}/>)}
    </div>
  )
}
```

### ```usePost<T=any>(path: string): [RequestState<T>, HookRunFunction<T>]```
### ```usePut<T=any>(path: string): [RequestState<T>, HookRunFunction<T>]```
### ```useDelete<T=any>(path: string): [RequestState<T>, HookRunFunction<T>]```

These three hooks map to the remaining three verbs in the REST API standard. Their usage is self explanatory.

The ```RequestState``` object has been previously described.

#### HookRunFunction\<T> = (params?: {id?: string; body?: object) => Promise\<T>

|Name |Type|Description|
|-----|----|-----------|
|id|string|Used by ```usePut``` and ```useDelete``` hooks.|
|body|object|Used by ```usePost``` to provide the entity to be created, and used by ```usePut``` to provide the fields to be updated.|

## Bonus

### ```usePagination(path: string, options?: Partial<RequestOptions>): [RequestState<T>, GetFunction<T>, NextPageFunction, PrevPageFunction, SeCurrentPageFunction, GetCurrentPage, SetPageSizeFunction]```

This hook works exactly the same as the ```useGet``` hook, only that it returns more variables. Besides the ones already described, the extra variables returned are functions designed to interact with the pagination of the data.

Not only this hook fetches the requested page, but it will also pre-fetch the next page.

## License

MIT © [Alexandru Niculae (alexnix)](https://github.com/alexnix)
