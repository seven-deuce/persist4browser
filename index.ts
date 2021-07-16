//creating internal variables with closure
var fields, expire, prefix, key, localStorage, sessionStorage, location, encrypt, encryptStorage
function isServer() {
    let server = false
    try {
        if (window) server = false
    } catch (err) {
        server = true
    }
    return server
}

class fakeStorage {
    constructor() {
        this.obj = {}
    }
    setItem(a, b) {
        this.obj[a] = b
        return this.obj
    }
    getItem(a) {
        return this.obj[a] || null
    }
}
function generateKey(prefix = "") {
    const origin = location.origin
    const keyChars = origin.split("").filter((item) => /[A-Za-z\d]/.test(item))
    const part1 = keyChars.filter((item, i) => i % 2 === 0).join("")
    const part2 = keyChars.filter((item, i) => i % 3 === 0).join("")
    const key = prefix + "_" + part1 + part2

    return key.length > 10 ? key : `${key}_persist4browser`
}

function expireDate(string) {
    // string could be like "1d" >> keep in local storage for 1 day
    // or  like "5m" >> keep in local storage for 5 minutes
    string = string.toLowerCase().trim()
    if (/\d+d/gi.test(string)) {
        const numberOfDays = Number(string.match(/\d+/)[0])
        return numberOfDays * 1000 * 60 * 60 * 24 + Date.now()
    } else if (/\d+m/gi.test(string)) {
        const numberOfDays = Number(string.match(/\d+/)[0])
        return numberOfDays * 1000 * 60 + Date.now()
    } else return ""
}

function isObject(state, name) {
    if (state === null || state === undefined) {
        console.warn(`${name} cannot be null or undefined!`)
        return false
    } else if (typeof state !== "object" || state instanceof Set || state instanceof Map || state instanceof Array) {
        console.warn(`${name} must be an object!`)
        return false
    } else return true
}

function persistState(state) {
    if (!isObject(state, "state")) return

    const storage = {}
    storage.expire = expireDate(expire) // Number
    storage.payload = {}

    if (!(fields instanceof Array)) throw Error("fields must be an array!")

    if (fields.includes("*")) storage.payload = { ...state }
    else {
        fields.forEach((item) => {
            if (state.hasOwnProperty(item)) {
                const obj = {}
                obj[item] = state[item]
                storage.payload = { ...storage.payload, ...obj }
            }
        })
    }

    if (storage.expire) {
        try {
            localStorage.setItem(key, JSON.stringify(storage))
        } catch (e) {
            console.warn("Error while persist4browser.save() was called:", e)
        }
    } else {
        try {
            sessionStorage.setItem(key, JSON.stringify(storage))
        } catch (e) {
            console.warn("Error while persist4browser.save() was called:", e)
        }
    }
    return storage.payload
}

function readState(initialState = {}) {
    if (!isObject(initialState, "initialState")) return

    let storage
    if (expire) {
        try {
            storage = localStorage.getItem(key)
        } catch (e) {
            console.warn("Error while persist4browser.read() was called:", e)
        }
    } else {
        try {
            storage = sessionStorage.getItem(key)
        } catch (e) {
            console.warn("Error while persist4browser.read() was called:", e)
        }
    }

  try {
            storage = typeof storage === "string" ? JSON.parse(storage) : storage
        } catch (e) {
            storage = initialState
        }

 

    if (storage === null || storage === undefined) return { ...initialState }
    else if (!storage.expire) {
        return { ...initialState, ...storage.payload }
    } else if (storage.expire && storage.expire < Date.now()) {
        return { ...initialState }
    } else if (storage.expire && storage.expire >= Date.now()) {
        return { ...initialState, ...storage.payload }
    } else return { ...initialState }
}

const f = {
    save: persistState,
    read: readState,
}

function persist4browser(options = {}) {
  if(isServer()) return {read: (initialState = {}) => initialState , save: ()=> ({})}
    const { EncryptStorage } = require("encrypt-storage")
    location = isServer() ? { origin: "temp" } : window.location
    fields = options.fields || ["*"]
    expire = options.expire || ""
    prefix = options.prefix || ""
    key = generateKey(prefix)
    encrypt = options.encrypt
    if (!options.encrypt ) {
        encrypt = null
        localStorage = isServer() ? new fakeStorage() : window.localStorage
        sessionStorage = isServer() ? new fakeStorage() : window.sessionStorage
    } else if (typeof encrypt === "string") {
        encryptStorage = EncryptStorage(encrypt, { storageType: expire ? "localStorage" : "sessionStorage" })
        localStorage = isServer() ? new fakeStorage() : encryptStorage
        sessionStorage = isServer() ? new fakeStorage() : encryptStorage
    } else if (encrypt === true) {
        encryptStorage = EncryptStorage(key, { storageType: expire ? "localStorage" : "sessionStorage" })
        localStorage = isServer() ? new fakeStorage() : encryptStorage
        sessionStorage = isServer() ? new fakeStorage() : encryptStorage
    }

    return f
}

if (!isServer()) window.persist4browser = persist4browser
module.exports = persist4browser