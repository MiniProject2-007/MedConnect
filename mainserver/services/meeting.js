import Meeting from "../Models/Meeting.js";

class MeetingService {
    createMeeting = async (appointment) => {
        try {
            const slug = Math.random().toString(36).substring(5);
            console.log("slug", slug);
            const meeting = await Meeting.create({
                appointmentId: appointment._id,
                time: appointment.timeSlot,
                date: appointment.date,
                status: "upcoming",
                duration: 60,
                slug,
            });
            return true;
        } catch (err) {
            console.log("Create Meeting Error: ", err);
            return false;
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
