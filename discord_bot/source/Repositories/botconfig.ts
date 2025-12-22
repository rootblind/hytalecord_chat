import database from "../Config/database.js";
import { CronString } from "../Interfaces/helper_types.js";

class BotConfigRepository {
    async getBackupSchedule(): Promise<CronString | null> {
        const {rows: data} = await database.query(
            `SELECT backup_db_schedule FROM botconfig`
        );
        if(data.length) {
            return data[0];
        } else {
            return null;
        }
    }
}

const BotConfigRepo = new BotConfigRepository();
export default BotConfigRepo;