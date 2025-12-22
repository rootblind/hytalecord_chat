/**
 * Once the main source finishes its execution, clientReady even source file is next.
 * Used for checks, setups and everything that either needs to be verified when the bot is active
 * or needs to run since the first seconds of the bot's execution.
 * Example: below the bot chooses a random presence to set to its profile, makes sure the client object is ready
 * makes sure the local directories it depends on are created and accessible, that all database tables are ready,
 * initializes the cron tasks and Discord collectors and executes on_ready_tasks.
 */
import type { Event } from "../../Interfaces/event.js";
import type { Client } from "discord.js";
import "colors";
import { errorLogHandle } from "../../utility_modules/error_logger.js";
import { 
    directory_array_check,
    formatDate,
    formatTime,
    get_current_version,
    read_json_async
} from "../../utility_modules/utility_methods.js";
import modelsInit from "../../Models/modelsInit.js";
import { bot_presence_setup } from "../../utility_modules/discord_helpers.js";
import fs from "graceful-fs";
import { ConfigSourcesJSON } from "../../Interfaces/helper_types.js";
import { load_onReady_tasks, on_ready_execute } from "../../utility_modules/onReadyTasksHandler.js";
import startServer from "../../server/server.js";

export type clientReadyHook = (client: Client) => Promise<void>;
const hooks: clientReadyHook[] = [];
export function extend_clientReady(hook: clientReadyHook) {
    hooks.push(hook);
}

async function runHooks(client: Client) {
    for(const hook of hooks) {
        try {
            await hook(client);
        } catch(error) {
            errorLogHandle(error, `clientReadyHook failed to execute.`);
        }
    }
}

const clientReady: Event = {
    name: "clientReady",
    once: true,
    async execute(client: Client) {
        if(!client.user) {
            const error = new Error("The bot failed to load the Client object, missing client.user or the entire client!");
            errorLogHandle(error);
            setTimeout(() => process.exit(1), 5_000);
            throw error;
        }

        const config_sources: ConfigSourcesJSON = await read_json_async("source/objects/config_sources.json");

        // initializing database tables
        try{
            await modelsInit();
        } catch(error) {
            errorLogHandle(error);
            setTimeout(() => process.exit(1), 5_000);
        }

        // initializing the needed directories to exist
        try {
            directory_array_check(config_sources.system_directories);
        } catch(error) {
            errorLogHandle(error);
            setTimeout(() => process.exit(1), 5_000);
        }

        // on ready tasks
        if(config_sources.on_ready_tasks) {
            try {
                const onReadyTasks = await load_onReady_tasks(config_sources.on_ready_tasks);
                if(onReadyTasks) await on_ready_execute(onReadyTasks);
            } catch(error) {
                errorLogHandle(error);
                setTimeout(() => process.exit(1), 5_000);
            }
        }

        // load event hooks (event extends)
        // re-using the on ready task logic
        // In order to add functionality to base sources, config_sources.event_hooks must implement them
        // in order to keep the base sources unchanged
        if(config_sources.event_hooks) {
            try {
                const eventHooks = await load_onReady_tasks(config_sources.event_hooks);
                if(eventHooks) await on_ready_execute(eventHooks);
            } catch(error) {
                errorLogHandle(error);
                setTimeout(() => process.exit(1), 5_000);
            }
        }

        // setting the bot's status presence
        try {
            await bot_presence_setup(
                client,
                config_sources.presence_config, 
                config_sources.default_presence_presets
            );
        } catch(error) {
            errorLogHandle(error);
        }

        // run extended code
        await runHooks(client);

        //////////////////////////////////////////////////////////////////
        //These lines of code are meant to be displayed at the very end//
        const justiceVersion = await get_current_version(); // fetch the version of the bot
        const currentDate = new Date();
        console.log(
            `${client.user.username}@${justiceVersion} is functional! - ${formatDate(currentDate)} | [${formatTime(currentDate)}]`
        );

        const errorFiles = fs.readdirSync(config_sources.error_dumps)
            .map((file: string) => file)
            .filter((file: string) => file !== 'error.log');
        
        if(errorFiles.length > 0) {
            console.log(`FOUND ${errorFiles.length} ERROR FILE${errorFiles.length > 1 ? "S" : ""}.`);
        }

        // EXPRESS SERVER
        await startServer(client);
        //////////////////////////////////////////////////////////////////
    }
}

export default clientReady;