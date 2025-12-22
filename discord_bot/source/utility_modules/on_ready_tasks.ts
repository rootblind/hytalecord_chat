/**
 * The tasks that must be ran once when the Bot is online and ready
 * 
 * Any unhandled errors will be handled by onReadyTasksHandler. If the task has fatal = true, the bot will shutdown.
 */

import type { CronTaskBuilder, OnReadyTaskBuilder } from "../Interfaces/helper_types.js";
import BotConfigRepo from "../Repositories/botconfig.js";
import { build_cron } from "./cronHandler.js";
import { get_env_var } from "./utility_methods.js";
import path from "path";
import { exec } from "child_process";
import { errorLogHandle } from "./error_logger.js";
import cron from "node-cron";

/**
 * If there is a configuration for database backups, this on ready task manages a cron scheduler for that
 */
export const backupDatabaseScheduler: OnReadyTaskBuilder = {
    name: "Backup Database Scheduler",
    task: async () => {
        const backupSchedule = await BotConfigRepo.getBackupSchedule();

        console.log(`Backup dir ${process.cwd()}`)
        if (backupSchedule) {
            const username = get_env_var("DBUSER");
            const database = get_env_var("DBNAME");

            const cronTaskBuilder: CronTaskBuilder = {
                name: "backup db",
                schedule: backupSchedule,
                job: async () => {
                    const refreshSchedule = await BotConfigRepo.getBackupSchedule();
                    if(backupSchedule !== refreshSchedule) {
                        // if by any means, the backup scheduler was modified, such as the usage of /backup-db
                        // stop the old schedule
                        stop();
                        return;

                    }

                    // formatting the file name
                    const date = new Date();
                    const fileName = `kayle_db_bk_${date.toISOString().replace(/:/g, "_").slice(0, -5)}.sql`;

                    const backup_command = 
                        `pg_dump -U ${username} -d ${database} -f ${path.join("./backup-db", fileName)}`;

                    const backupPromise = new Promise((resolve, reject) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        exec(backup_command, (err, stdout, _stderr) => {
                            if(err) {
                                errorLogHandle(err);
                                reject(err);
                            }
                            resolve(stdout.trim());
                        });
                    });

                    await backupPromise;
                },
                runCondition: async () => true
            }

            const cronTask = build_cron(cronTaskBuilder);
            cronTask.start();

            function stop() { cronTask.stop() };
        }

    },
    runCondition: async () => {
        const schedule = await BotConfigRepo.getBackupSchedule();
        return schedule !== null && cron.validate(schedule as string);
    }
}