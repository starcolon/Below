# Grid maker tool

A web-based light-weight tool for grid design and save to mongodb.

## Quick use:

Just simply run **index.html** on your favorite browser. Make a good design of your grid using the tool and you can export it as a JSON string.

## Save grid to mongodb

To run the maker tool server:

```bash
    cd ./mongo_integrat_server
    node svr
```

The configuration for the server can be simply set in `package.json`.

## Supported Browser

If you have tried this application on Firefox, it wouldn't be surprised it didn't work. Yes, I recommend you to access the webapp via Chrome.

#### Why Firefox doesn't support?

Good question with simple answer indeed. Firefox doesn't yet support the ECMAScript 6's `let` keyword which is currently used by this app. Chrome is familiar with this keyword so it won't cause any problem.