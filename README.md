# persist4browser

persist4browser is a library that helps you with saving and reading your state in browser, by using localStorage. So if the page is refreshed, you still can persist your state. It could be used on its own or inside SPA frameworks like React.

## Installation

```sh
$ npm install persist4browser
``` 

### Browser
``` 
<script src="https://unpkg.com/persist4browser@latest/umd/persist4browser.js"></script>
``` 

## Basic usage 
```
// call the exported function:
const persist4browser = require("persist4browser")()

const state = {
	username: "Tom",
	login: true
}
// save the state to localStorage of the browser
persisted4browser.save(state)

// access the saved state
const username = persisted4browser.read().username
console.log(username) // "Tom"

// no matter how many times the page is refreshed,
// the saved state will remain unchanged


```

## API

### ```persist4browser(options)```

**options** is an object that you may pass to the constructor for advanced configuration on the instance. This could be useful when you want to create more that 1 persistence instance on the same domain address.

* `prefix` : an optional `String` that will appear as the beginning part of a unique key that will be used to save state in localStorage. Having a `prefix` has 2 benefits: It will be easy for you to look up your saved state in localStorage of the browser since the key will start with your `prefix`. Secondly, you will be able to create multiple states in localStorage that are different from each other and they will not collide. See the example below:

```
const users = require("persist4browser")({ prefix: "users" })
const products = require("persist4browser")({ prefix: "products" })

users.save({name: "Tom"})
products.save({name: "laptop"})

users.read().name // "Tom"
products.read().name // "laptop"

```

* `expire` : an optional `String` that will tell localStorage for how long to keep the state saved. If you want it to be saved for 2 minutes only, you pass `"2m"`, if you want it to stay for 3 days, you pass `"3d"`. 
If you do not specify `expire` option, the localSession will be used to store your state. Therefore once the user closes the page on the browser, the saved state will be lost.

```
const users = require("persist4browser")({ expire : "1m" })


users.save({name: "Tom"})

users.read().name // "Tom"

if called after 1 minute passed:
users.read().name // {}

```

* `fields` : sometime you have a big state but you don't want to save all its keys into localStorage. In this case, you can pass an `Array` containing all the fields that you want to save, and only those fields will be saved.
If you pass an empty array: `[]`, no state will be saved.
If you do not set the `fields`, we assume that you want all the properties in the state object be saved into localStorage.

```
const users = require("persist4browser")({ fields : ["name"] })

users.save({name: "Tom", age:  27 })

users.read().name // "Tom"
users.read().age // undefined

```


<br />

### ```persist4browser().save(state)```

* `state` is an object that you want to save to localStorage. It is mandatory.

<br />

### ```persist4browser().read(initialState)```

* `initialState` is an object that you can optionally supply to the `read` method. When this method finds the saved state from localStorage, it will merge it with `initialState`. The values that are saved in localStorage will overwrite the `initialState` if they share the same key name.
This is useful when in an app, you call the `read` method before calling the `save` method.

```
const users = require("persist4browser")()

users.read({name: "Tom"}).name // "Tom" 

users.save({name: "Jack" })

users.read().name // "Jack"

users.read({name: "Tom"}).name // "Jack"


```

## Integration with React.js
See this repo as a sample of how to inegrate it with React: https://github.com/seven-deuce/no-redux-app-with-persistence 
