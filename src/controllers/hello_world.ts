/**
 * A API for testing
 */
async function helloWorld(ctx, next) {
    ctx.response.type = 'json'
    ctx.body = { data: 'Hello World!'}
}

export default helloWorld
