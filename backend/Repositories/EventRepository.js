
const Event = require("../Models/Event");

class EventRepository {
    static async findUpcomingEvents(organizationName = "") {
        const query = {
            date: { $gte: new Date() },
            status: { $ne: "canceled" }
        };

        // Filter by organization name when a search is provided
        if (organizationName) {
            query.organization = {
                $regex: organizationName,
                $options: "i"
            };
        }

        return await Event.find(query).sort({ date: 1 });
    }
}

module.exports = EventRepository;