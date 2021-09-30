// TODO check any
function pager (query = {}) {
    const result= {
        limit: 10,
        skip: 0
    };

    if (query.per_page) {
        result.limit = query.per_page
    }
    if (query.page) {
        result.skip = result.limit * (query.page - 1)
    }

    return result
}

module.exports = pager