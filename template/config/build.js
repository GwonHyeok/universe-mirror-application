const { say } = require('cfonts')
const chalk = require('chalk')
const del = require('del')
const { spawn } = require('child_process')
const webpack = require('webpack')
const Multispinner = require('multispinner')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

const componentConfig = require('./webpack.component.config')
const pluginConfig = require('./webpack.plugin.config')

function build() {
    greeting()

    del.sync(['dist/*', '!.gitkeep'])

    const tasks = ['component', 'plugin']
    const m = new Multispinner(tasks, {
        preText: 'building',
        postText: 'process'
    })

    let results = ''

    m.on('success', () => {
        process.stdout.write('\x1B[2J\x1B[0f')
        console.log(`\n\n${results}`)
        console.log(`${okayLog}take it away ${chalk.yellow('`universe-mirror-application`')}\n`)
        process.exit()
    })

    pack(pluginConfig).then(result => {
        results += result + '\n\n'
        m.success('plugin')
    }).catch(err => {
        m.error('plugin')
        console.log(`\n  ${errorLog}failed to build plugin process`)
        console.error(`\n${err}\n`)
        process.exit(1)
    })

    pack(componentConfig).then(result => {
        results += result + '\n\n'
        m.success('component')
    }).catch(err => {
        m.error('component')
        console.log(`\n  ${errorLog}failed to build component process`)
        console.error(`\n${err}\n`)
        process.exit(1)
    })
}

function greeting() {
    const cols = process.stdout.columns
    let text = ''

    if (cols > 85) text = 'start-build'
    else if (cols > 60) text = 'start-|build'
    else text = false

    if (text && !isCI) {
        say(text, {
            colors: ['yellow'],
            font: 'simple3d',
            space: false
        })
    } else console.log(chalk.yellow.bold('\n  start-build'))
    console.log()
}

function pack(config) {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) reject(err.stack || err)
            else if (stats.hasErrors()) {
                let err = ''

                stats.toString({
                    chunks: false,
                    colors: true
                })
                    .split(/\r?\n/)
                    .forEach(line => {
                        err += `    ${line}\n`
                    })

                reject(err)
            } else {
                resolve(stats.toString({
                    chunks: false,
                    colors: true
                }))
            }
        })
    })
}

build()