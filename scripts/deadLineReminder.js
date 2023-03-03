const jobs = require('../models/jobs');
const collectiveJobs = require('../models/collectiveJobs');

const socketlabs = require('../util/socketlabs');

module.exports = setInterval(async () => {
    const jobRows = await jobs.getDeadLineIn24Hours();

    if (jobRows.length > 0) {
        await socketlabs.deadLineReminder(jobRows);

        const jobIds = jobRows.map((value) => {
            if (!value.collectiveId) {
                return value.id;
            }
        });

        const collectiveIds = jobRows.map((value) => {
            if (value.collectiveId) {
                return value.collectiveId;
            }
        });

        await jobs.setReminded(jobIds);
        await collectiveJobs.setReminded(collectiveIds);
    }


}, 100000);



