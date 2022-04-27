import * as core from '@actions/core'
import * as github from '@actions/github'

async function run() {
    try {
//        core.info(`context: ${JSON.stringify(github.context)}`)

        const payload = github.context.payload
        const client_payload = github.context.payload.client_payload
        const action = github.context.payload.action


        //const action = core.getInput('action')
        //const targetUsers = core.getInput('targetUsers')

        //core.info(`payload: ${JSON.stringify(payload)}`)
        core.info(`client_payload: ${JSON.stringify(client_payload)}`)
        core.info(`action: ${JSON.stringify(payload.action)}`)
        core.info(`event_name: ${github.context.eventName}`)
        //core.info(`client_payload: ${core.getInput('client_payload')}`)


    } catch (error) {
        core.setFailed(error.message)
    }
}

run()