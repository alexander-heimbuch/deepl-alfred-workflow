module.exports = {
  output: items => {
    console.log(JSON.stringify({items}, null, '\t'))
  },
  input: process.argv[2]
}
