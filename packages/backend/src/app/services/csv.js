const { createWriteStream, createReadStream } = require('fs')

const encode = (row) => {
  return row
    .map((value) => {
      if (typeof value === 'string') {
        return `"${value.replace(/()"/g, '""')}"`
      }

      return value
    })
    .join(',')
}

const createCsvFile = async (title, data, columns) => {
  const writer = createWriteStream(`${title}.csv`, { flags: 'w+' })

  if (columns) {
    writer.write(columns.join(','))
  }

  data.forEach((row) => writer.write(`${columns ? '\n' : ''}${encode(row)}`))

  writer.end()

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      writer.close()

      resolve(createReadStream(`${title}.csv`))
    })
    writer.on('error', (err) => {
      writer.close()
      reject(err)
    })
  })
}

module.exports = {
  encode,
  createCsvFile,
}
