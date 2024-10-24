const { Client, logger } = require('./lib/client')
const { DATABASE, VERSION } = require('./config')
const { stopInstance } = require('./lib/pm2')

const start = async () => {
  logger.info(`levanter ${VERSION}`)
  try {
    await DATABASE.authenticate({ retry: { max: 3 } })
  } catch (error) {
    const databaseUrl = process.env.DATABASE_URL
    logger.error({ msg: 'Unable to connect to the database', error: error.message, databaseUrl })
    return stopInstance()
  }
  try {
    const bot = new Client()
    await bot.connect()
  } catch (error) {
    logger.error(error)
  }
}
start()
const { spawnSync, spawn } = require('child_process')
const { existsSync, writeFileSync } = require('fs')
//read last lines!!!!!!!!!!!!!!

const SESSION_ID = 'updateThis' // Edit this line only, don't remove ' <- this symbol

function startApp() {
  const child = spawn('node', ['index.js'], { cwd: 'levanter', stdio: 'inherit' })

  child.on('exit', (code) => {
    if (code !== 0) {
      console.log('restarting...')
      startApp()
    }
  })
}

if (!existsSync('levanter')) {
  console.log('Cloning the repository...')
  const cloneResult = spawnSync(
    'git',
    ['clone', 'https://github.com/lyfe00011/levanter.git', 'levanter'],
    {
      stdio: 'inherit',
    }
  )

  if (cloneResult.error) {
    throw new Error(`Failed to clone the repository: ${cloneResult.error.message}`)
  }

  const configPath = 'levanter/config.env'
  try {
    console.log('Writing to config.env...')
    writeFileSync(configPath, `VPS=true\nSESSION_ID=${SESSION_ID}`)
  } catch (err) {
    throw new Error(`Failed to write to config.env: ${err.message}`)
  }

  console.log('Installing dependencies...')
  const installResult = spawnSync('yarn', ['install', '--network-concurrency', '3'], {
    cwd: 'levanter',
    stdio: 'inherit',
  })

  if (installResult.error) {
    throw new Error(`Failed to install dependencies: ${installResult.error.message}`)
  }
}

//if dependencies error uncomment below line

// spawnSync('yarn', ['install', '--network-concurrency', '3'], {
//   cwd: 'levanter',
//   stdio: 'inherit',
// })

startApp() //delete this line to use pm2

// spawnSync('yarn', ['docker'], { cwd: 'levanter', stdio: 'inherit' }) //remove // on this line to use pm2
