const LotusApiClient = require('../src/app/lotus/lotus.service')

const run = async () => {
  const client = new LotusApiClient()

  try {
    const result = await client.getChainHead()
    console.info('result', JSON.stringify(result, null, 2))
    process.exit(0)
  } catch (error) {
    console.error('ERR', error)
    process.exit(1)
  }
}
run()
