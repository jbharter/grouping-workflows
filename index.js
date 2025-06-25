import * as core from '@actions/core'
import * as github from '@actions/github'
import {readFile, readFileSync, writeFileSync, existsSync, readdirSync, lstatSync} from 'fs';
import path from 'path';
import {Buffer} from 'buffer';
// import * as HCL from 'js-hcl-parser';
import * as os from 'os';

function readObject(filename){
    return new Promise((resolve, reject) => {
        readFile(filename, (err,data) => {
            if (err) {
                reject(err);
            } else {
                let stringData = data.toString();
                if (filename.endsWith(".json")) {
                    resolve(JSON.parse(stringData));
                }
                reject("unknown file type")
            }
        })
    })
}

function readObjectSync(filename) {
    const data = readFileSync(filename);
    let stringData = data.toString();
    if (filename.endsWith(".json")) {
        return JSON.parse(stringData);
    } else {
        return data;
    }
}

// Helper function to write data out to file with trailing newline.
function writeJsonToFile(data, filename) {
    let jsonString = JSON.stringify(data, null, 2).concat('\n')
    writeFileSync(filename,new Uint8Array(Buffer.from(jsonString)));
}

const exceptionGroupFile = "exception-groups/groups.json";
const squadsFile = "squads.json";
const platoonsFile = "platoons.json";
const platoonsDir = "eng_meta_testing/platoons";
const exceptionSquadsDir = "eng_meta_testing/exception_squads";


async function offboard(user) {
    let action = "offboard";
    core.info(`${action}-ing: ${user}`)

    if (existsSync(exceptionGroupFile)) {
        await readObject(exceptionGroupFile)
            .then(data => {
                // do stuff
                let write = false;
                Object.entries(data["groups"]).forEach(([group_name,val],squadIndex) => {
                    if (Object.keys(val["members"]).includes(user)) {
                        console.log(`User: "${user} found in members of exception group: "${group_name}"`)
                        data["groups"][group_name]["members"] = Object.fromEntries(Object.entries(val["members"]).filter(([locuser, role]) => locuser !== user));
                        write = true
                    }
                })
                if (write) {
                    console.log(`writing new ${exceptionGroupFile} to ${action} user: ${user}`)
                    writeJsonToFile(data, exceptionGroupFile);
                }
            })
            .catch(err => console.error(err));
    } else {
        console.log(`exception group file ${exceptionGroupFile} does not exist`)
    }


    // TODO: check platoons file, consider a method to replace a platoon/squad lead?
    // readObject(platoonsFile)
    //     .then(data => {
    //         //console.dir(data);
    //         // TODO: offboard in platoons.json
    //     })
    //     .catch(err => console.error(err));
    // check squads file
    if (existsSync(squadsFile)) {
        await readObject(squadsFile)
            .then(data => {
                // Offboard in squads.json
                let write = false;
                data["squads"].forEach((squad,squadIndex) => {
                    squad["team"].forEach((team,teamIndex) => {
                        if (team["associates"].includes(user)) {
                            console.log(`User: "${user} found in associates of squad: "${squad.id}", location: ${team.location}`)
                            data["squads"][squadIndex]["team"][teamIndex]["associates"] = team["associates"].filter(associate => associate !== user);
                            write = true;
                        }
                        if (team["members"].includes(user)) {
                            console.log(`User: "${user} found in members of squad: "${squad.id}", location: ${team.location}`)
                            data["squads"][squadIndex]["team"][teamIndex]["members"] = team["members"].filter(associate => associate !== user);
                            write = true;
                        }
                    })
                })
                if (write) {
                    console.log(`writing new ${squadsFile} to ${action} user: ${user}`)
                    writeJsonToFile(data, squadsFile);
                }
            })
            .catch(err => console.error(err));
    } else {
        console.log(`squads file ${squadsFile} does not exist`)
    }

    // Handle new eng_meta schema for platoons
    if (existsSync(platoonsDir) && lstatSync(platoonsDir).isDirectory()) {
        readdirSync(platoonsDir).forEach(platoonFile => {
            if (platoonFile.endsWith(".json")) {
                readObject(path.join(platoonsDir, platoonFile))
                    .then(data => {
                        // Offboard in <platoon>.json
                        let write = false;
                        data["platoon"][0]["squads"].forEach((squad,squadIndex) => {
                            squad["team"].forEach((team,teamIndex) => {
                                if (team["associates"].includes(user)) {
                                    console.log(`[${path.join(platoonsDir, platoonFile)}] User: "${user} found in associates of squad: "${squad.id}", location: ${team.location}`)
                                    data["platoon"][0]["squads"][squadIndex]["team"][teamIndex]["associates"] = team["associates"].filter(associate => associate !== user);
                                    write = true;
                                }
                                if (team["members"].includes(user)) {
                                    console.log(`[${path.join(platoonsDir, platoonFile)}] User: "${user} found in members of squad: "${squad.id}", location: ${team.location}`)
                                    data["platoon"][0]["squads"][squadIndex]["team"][teamIndex]["members"] = team["members"].filter(associate => associate !== user);
                                    write = true;
                                }
                            })
                        })
                        if (write) {
                            console.log(`writing new ${path.join(platoonsDir, platoonFile)} to ${action} user: ${user}`)
                            writeJsonToFile(data, path.join(platoonsDir, platoonFile));
                        }
                    })
                    .catch(err => console.error(err));
            }
        });
    }

    // Handle new eng_meta schema for exception squads
    if (existsSync(exceptionSquadsDir) && lstatSync(exceptionSquadsDir).isDirectory()) {
        readdirSync(exceptionSquadsDir).forEach(exceptionFile => {
            if (exceptionFile.endsWith(".json")) {
                readObject(path.join(exceptionSquadsDir, exceptionFile))
                    .then(data => {
                        // Offboard in <platoon>.json
                        let write = false;
                        data["exceptions"][0]["squads"].forEach((squad,squadIndex) => {
                            squad["team"].forEach((team,teamIndex) => {
                                if (team["associates"].includes(user)) {
                                    console.log(`User: "${user} found in associates of exception squad: "${squad.id}", location: ${team.location}`)
                                    data["exceptions"][0]["squads"][squadIndex]["team"][teamIndex]["associates"] = team["associates"].filter(associate => associate !== user);
                                    write = true;
                                }
                                if (team["members"].includes(user)) {
                                    console.log(`User: "${user} found in members of exception squad: "${squad.id}", location: ${team.location}`)
                                    data["exceptions"][0]["squads"][squadIndex]["team"][teamIndex]["members"] = team["members"].filter(associate => associate !== user);
                                    write = true;
                                }
                            })
                        })
                        if (write) {
                            console.log(`writing new ${path.join(exceptionSquadsDir, exceptionFile)} to ${action} user: ${user}`)
                            writeJsonToFile(data, path.join(exceptionSquadsDir, exceptionFile));
                        }
                    })
                    .catch(err => console.error(err));
            }
        });
    }

    console.log(`end run for user: ${user}`)
}

function oktausernamechange(oldoktausername,newoktausername) {
    let action = "oktausernamechange";
    core.info(`${action}-ing: ${oldoktausername} => ${newoktausername}`)

    // TODO: check exception groups
    readObject(exceptionGroupFile)
        .then(data => {
            // do stuff
            let write = false;
            Object.entries(data["groups"]).forEach(([group_name,val],squadIndex) => {
                if (Object.keys(val["members"]).includes(oldoktausername)) {
                    console.log(`User: "${oldoktausername} found in members of exception group: "${group_name}"`)
                    let role = data["groups"][group_name]["members"][oldoktausername]
                    delete data["groups"][group_name]["members"][oldoktausername];
                    data["groups"][group_name]["members"][newoktausername] = role
                    write = true
                }
            })
            if (write) {
                console.log(`writing new ${exceptionGroupFile} to ${action} user: ${oldoktausername}`)
                writeJsonToFile(data, exceptionGroupFile);
            }
        })
        .catch(err => console.error(err));



    // TODO: check platoons file, consider a method to replace a platoon/squad lead?
    // readObject(platoonsFile)
    //     .then(data => {
    //         //console.dir(data);
    //         // TODO: offboard in platoons.json
    //     })
    //     .catch(err => console.error(err));
    // check squads file
    readObject(squadsFile)
        .then(data => {
            // Offboard in squads.json
            let write = false;
            data["squads"].forEach((squad,squadIndex) => {
                squad["team"].forEach((team,teamIndex) => {
                    if (team["associates"].includes(oldoktausername)) {
                        console.log(`User: "${oldoktausername} found in associates of squad: "${squad.id}", location: ${team.location}`)
                        data["squads"][squadIndex]["team"][teamIndex]["associates"] = team["associates"].map(associate => {
                            if (associate === oldoktausername){
                                return newoktausername;
                            } else {
                                return associate;
                            }
                        });
                        write = true;
                    }
                    if (team["members"].includes(oldoktausername)) {
                        console.log(`User: "${oldoktausername} found in members of squad: "${squad.id}", location: ${team.location}`)
                        data["squads"][squadIndex]["team"][teamIndex]["members"] = team["members"].map(associate => {
                            if (associate === oldoktausername){
                                return newoktausername;
                            } else {
                                return associate;
                            }
                        });
                    }
                })
            })
            if (write) {
                console.log(`writing new ${squadsFile} to ${action} user: ${oldoktausername}`)
                writeJsonToFile(data, squadsFile);
            }
        })
        .catch(err => console.error(err));
    console.log(`end run for user: ${oldoktausername}`)
}

async function run() {
    try {

        const payload = github.context.payload
        const client_payload = payload.client_payload
        const action = payload.action
        core.info(`debug action:${github.context.action}`)
        core.info(`debug workflow:${github.context.workflow}`)


        core.info(`Setting up to ${action}`)
        switch (action) {
            // case "onboard":
            //     users.forEach(onboard)
            //     break
            case "offboard":
                const users = client_payload.users

                core.setOutput("action", action)
                core.setOutput("users", JSON.stringify(users))
                for(let user in users) {
                    offboard(user)
                }
                //users.forEach(offboard)
                break
            case "oktausernamechange":
                oktausernamechange(client_payload.old_okta_username, client_payload.new_okta_username)
                break
            default:
                core.error(`Unsupported action: ${action}`)
                core.setFailed(`Unsupported action: ${action}`)
        }


    } catch (error) {
        core.setFailed(error.message)
    }
}

async function test(testData, action) {

    console.log("::set-output name=foo::bar")
    core.info("::set-output name=core::bar")

    switch (action) {
        // case "onboard":
        //     users.filter(s => s !== "").forEach(onboard)
        //     break
        case "offboard":
            let users = testData.client_payload.users
            //users.filter(s => s !== "").forEach(offboard)
            for(const user of users) {
                await offboard(user)
            }

            break
        case "oktausernamechange":
            oktausernamechange(testData.client_payload.old_okta_username, testData.client_payload.new_okta_username)
            break
        default:
            core.error(`Unsupported action: ${action}`)
            core.setFailed(`Unsupported action: ${action}`)
    }
}

if (os.platform() === "darwin") {
     test({
         "client_payload": {
             "users": [
                 // "tpisar",
                 // "dwiese",
                 // "pbharg",
                 // "rren",
                 // "ereddy",
                 // "yulin",
                 // "tsiebe",
                 "jharte"
             ]
         }
     },"offboard")
    //test({
    //    "client_payload": {
    //        "old_okta_username": "olduid",
    //        "new_okta_username": "newuid"
    //    }
    //},"oktausernamechange")
} else {
    await run()
}

