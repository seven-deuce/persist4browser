if (!window || !document) {
	console.warn("persist4browser works only in browser")
}

//creating internal variables with closure
var fields, expire, prefix, key

function generateKey(prefix = "") {
	const origin = window.location.href
	const keyChars = origin.split("").filter((item) => /[A-Za-z\d]/.test(item))
	const part1 = keyChars.filter((item, i) => i % 2 === 0).join("")
	const part2 = keyChars.filter((item, i) => i % 3 === 0).join("")
	const key = prefix + part1 + part2

	return key
}

function expireDate(string) {
	// string could be like "1d" >> keep in local storage for 1 day
	// or  like "5m" >> keep in local storage for 5 minutes
	string = string.toLowerCase().trim()
	if (/\dd/gi.test(string)) {
		const numberOfDays = Number(string.match(/\d/)[0])
		return numberOfDays * 1000 * 60 * 60 * 24 + Date.now()
	} else if (/\dm/gi.test(string)) {
		const numberOfDays = Number(string.match(/\d/)[0])
		return numberOfDays * 1000 * 60 + Date.now()
	} else return ""
}

function isObject(state, name) {
	if (state === null || state === undefined) {
		console.warn(`${name} cannot be null or undefined!`)
		return false
	} else if (
		typeof state !== "object" ||
		state instanceof Set ||
		state instanceof Map ||
		state instanceof Array
	) {
		console.warn(`${name} must be an object!`)
		return false
	} else if (!window.localStorage) {
		console.warn("window.localStorage is not available in this environment!")
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
			window.localStorage.setItem(key, JSON.stringify(storage))
		} catch (e) {
			console.warn("Error while persist4browser.save() was called:", e)
		}
	} else {
		try {
			window.sessionStorage.setItem(key, JSON.stringify(storage))
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
			storage = window.localStorage.getItem(key)
		} catch (e) {
			console.warn("Error while persist4browser.read() was called:", e)
		}
	} else {
		try {
			storage = window.sessionStorage.getItem(key)
		} catch (e) {
			console.warn("Error while persist4browser.read() was called:", e)
		}
	}
	storage = JSON.parse(storage)

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
	fields = options.fields || ["*"]
	expire = options.expire || ""
	prefix = options.prefix || ""
	key = generateKey(prefix)
	return f
}

window.persist4browser = persist4browser
module.exports = persist4browser