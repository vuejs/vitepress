#!/usr/bin/env node
require('../dist').createServer().listen(3000, () => {
  console.log('listening at http://localhost:3000')
})
