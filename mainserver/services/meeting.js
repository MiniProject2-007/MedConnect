import Meeting from "../Models/Meeting.js";

class MeetingService {
    createMeeting = async () => {
        try {
            const slug = Math.random().toString(36).substring(5);
            console.log("slug", slug);
            const meeting = await Meeting.create({
                slug,
                duration: 30,
            });
            return { success: true, meeting: meeting };
        } catch (err) {
            console.log("Create Meeting Error: ", err);
            return { success: false, slug: null };
        }
    };

    getAppointmentMeeting = async (appointmentId) => {
        try {
            const meeting = await Meeting.findOne({ appointmentId }).select(
                "-createdAt -updatedAt -__v"
            );
            return meeting;
        } catch (err) {
            console.log("Get Appointment Meeting Error: ", err);
            return null;
        }
    };
}

export default new MeetingService();
