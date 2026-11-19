
const EventRepository = require("../Repositories/EventRepository");

class EventService {
    static async getUpcomingEvents(organizationName = "") {
        return await EventRepository.findUpcomingEvents(organizationName);
    }
}

module.exports = EventService;