## Tools and frameworks used

- [NestJS](https://github.com/nestjs/nest)
- [Typescript](https://www.typescriptlang.org/)
- [Typeorm](https://typeorm.io/#/)

## Installation

After cloning this project and cd to directory,

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# Endpoints

- `GET /acronym?from=50&limit=10&search=:search`
  - returns a list of acronyms, paginated using query parameters
  - returns all acronyms that fuzzy match against `:search`
  - response headers indicate if there are more results
    - X-Pagination-Count - `The total number of pages according to limit param, default/hard limit is 10`
    - X-Pagination-Page - `The current page given limit and offset`
    - X-Pagination-Limit - `The current page limit`
    - X-More-Records - `Boolean. If more records are avaible`
    - X-Total-Records - `Total number of result for the current search query`
- GET /acronym/:acronym
  - returns the acronym and definitions matching `:acronym`
- GET /random/:count?
  - returns a number of `:count` random acronyms
- POST /acronym
  - receives an acronym and definition and creates the acronym if not exist or adds the definition if it exists.
  - Body `acronym: string; definition: string;`
- PUT /acronym/:acronym
  - uses an authorization header to ensure acronyms are protected. Dummy implementation but Authorization Header is required.
  - updates the acronym definition to the db for `:acronym`
  - Body `definitionId: string; readonly definition: string;`. The `definitionId` is needed since an acronym can have multiple definitions
- DELETE /acronym/:acronym
  - deletes the acronym and all definitions for the `:acronym`
  - uses an authorization header to ensure acronyms are protected. Dummy implementation but Authorization Header is required.
