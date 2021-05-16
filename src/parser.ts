export default class Parser {
    private static async toJsonSafe(json) {
        json = typeof json !== 'string' ? JSON.stringify(json) : json

        try { json = await JSON.parse(json) }
        catch (e) { return false }

        if (typeof json === 'object' && json !== null) return json
        return false
    }

    public static async json(req, res, next) {
        // checks
        if (!req) throw ReferenceError('req is undefined')
        if (req.parsed) return next()
        if (!req.body) throw ReferenceError('req.body is undefined')
        if (!next) throw ReferenceError('next is undefined')
        if (typeof next !== 'function') throw TypeError('next must be a function')

        // parsing
        let parsed = await Parser.toJsonSafe(req.body)
        if (parsed) {
            req.parsed = true
            req.body = parsed
        }
        next()
    }

    public static async urlencoded(req, res, next) {
        // checks
        if (!req) throw ReferenceError('req is undefined')
        if (req.parsed) return next()
        if (!req.body) throw ReferenceError('req.body is undefined')
        if (!next) throw ReferenceError('next is undefined')
        if (typeof next !== 'function') throw TypeError('next must be a function')

        // parsing
        let parsed = {}
        let arr = req.body.split('&')
        for (let item of arr) {
            let kv = item.split('=')
            parsed[kv[0]] = kv[1]
        }
        req.parsed = true
        req.body = parsed
        next()
    }
}